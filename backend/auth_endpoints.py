# Customer Authentication Endpoints
# Diese werden in server.py eingefügt

# ============= CUSTOMER AUTH ENDPOINTS =============
# Register new customer
@api_router.post("/auth/register")
async def register_customer(user_data: UserCreate):
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user document
        user_doc = {
            "id": str(uuid.uuid4()),
            "email": user_data.email,
            "hashed_password": get_password_hash(user_data.password),
            "first_name": user_data.first_name,
            "last_name": user_data.last_name,
            "auth_provider": "email",
            "is_member": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }
        
        await db.users.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token(data={"sub": user_doc["id"]})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user_doc["id"],
                "email": user_doc["email"],
                "first_name": user_doc.get("first_name"),
                "last_name": user_doc.get("last_name")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

# Customer login
@api_router.post("/auth/login")
async def login_customer(login_data: UserLogin):
    try:
        # Find user by email
        user = await db.users.find_one({"email": login_data.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(login_data.password, user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Update last login
        await db.users.update_one(
            {"id": user["id"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Create access token
        access_token = create_access_token(data={"sub": user["id"]})
        
        return {
            "success": True,
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "is_member": user.get("is_member", True)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error logging in user: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

# Get current user info
@api_router.get("/auth/me")
async def get_current_user_info(user_id: str = Depends(get_current_user)):
    try:
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "hashed_password": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user info: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch user info")

# Get user orders
@api_router.get("/auth/orders")
async def get_user_orders(user_id: str = Depends(get_current_user)):
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Find orders by user email
        orders = await db.orders.find({"customer_email": user["email"]}, {"_id": 0}).sort("created_at", -1).to_list(length=100)
        return orders
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders")

# Request password reset
@api_router.post("/auth/password-reset-request")
async def request_password_reset(request: PasswordResetRequest):
    try:
        user = await db.users.find_one({"email": request.email})
        if not user:
            # Don't reveal if email exists
            return {"success": True, "message": "If your email is registered, you will receive a password reset link"}
        
        # Generate reset token
        reset_token = create_access_token(
            data={"sub": user["id"], "purpose": "password_reset"},
            expires_delta=timedelta(hours=1)
        )
        
        # Save token in database
        await db.password_reset_tokens.insert_one({
            "user_id": user["id"],
            "token": reset_token,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "used": False
        })
        
        # Send email with reset link
        smtp_host = os.environ.get('SMTP_HOST')
        smtp_port = int(os.environ.get('SMTP_PORT', 587))
        smtp_user = os.environ.get('SMTP_USER')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"
        
        message = MIMEMultipart("alternative")
        message["Subject"] = "Password Reset - ApeBrain.cloud"
        message["From"] = smtp_user
        message["To"] = user["email"]
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; padding: 30px;">
                <h2 style="color: #7a9053;">🍄 Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested to reset your password for your ApeBrain.cloud account.</p>
                <p>Click the button below to reset your password (link expires in 1 hour):</p>
                <a href="{reset_link}" style="display: inline-block; background-color: #7a9053; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
                <p style="color: #6b7280; font-size: 0.9rem;">If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #9ca3af; font-size: 0.8rem;">ApeBrain.cloud - god knows how</p>
            </div>
        </body>
        </html>
        """
        
        message.attach(MIMEText(html_content, "html"))
        
        await aiosmtplib.send(
            message,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True
        )
        
        return {"success": True, "message": "If your email is registered, you will receive a password reset link"}
    except Exception as e:
        logging.error(f"Error requesting password reset: {str(e)}")
        return {"success": True, "message": "If your email is registered, you will receive a password reset link"}

# Reset password
@api_router.post("/auth/password-reset")
async def reset_password(reset_data: PasswordReset):
    try:
        # Verify token
        payload = jwt.decode(reset_data.token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        purpose = payload.get("purpose")
        
        if purpose != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
        
        # Check if token was already used
        token_record = await db.password_reset_tokens.find_one({"token": reset_data.token, "used": False})
        if not token_record:
            raise HTTPException(status_code=400, detail="Reset token already used or invalid")
        
        # Update password
        hashed_password = get_password_hash(reset_data.new_password)
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"hashed_password": hashed_password}}
        )
        
        # Mark token as used
        await db.password_reset_tokens.update_one(
            {"token": reset_data.token},
            {"$set": {"used": True}}
        )
        
        return {"success": True, "message": "Password reset successful"}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error resetting password: {str(e)}")
        raise HTTPException(status_code=500, detail="Password reset failed")
