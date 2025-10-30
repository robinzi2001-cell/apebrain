from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import asyncio
from emergentintegrations.llm.chat import LlmChat, UserMessage
import base64
import re
import paypalrestsdk
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure PayPal
paypalrestsdk.configure({
    "mode": os.environ.get('PAYPAL_MODE', 'sandbox'),
    "client_id": os.environ.get('PAYPAL_CLIENT_ID', ''),
    "client_secret": os.environ.get('PAYPAL_CLIENT_SECRET', '')
})

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    keywords: str
    image_url: Optional[str] = None
    image_base64: Optional[str] = None
    video_url: Optional[str] = None  # YouTube URL
    audio_url: Optional[str] = None  # Audio file URL or base64
    status: str = "draft"  # draft or published
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

class BlogPostCreate(BaseModel):
    keywords: str

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    keywords: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    status: Optional[str] = None

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminSettingsUpdate(BaseModel):
    current_password: str
    admin_username: str
    new_password: Optional[str] = None

# Shop Models
class OrderItem(BaseModel):
    product_id: str
    name: str
    price: float
    quantity: int
    product_type: str  # physical or digital

class CreateOrder(BaseModel):
    items: List[OrderItem]
    total: float
    customer_email: str
    coupon_code: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_id: Optional[str] = None
    items: List[dict]
    total: float
    customer_email: str
    coupon_code: Optional[str] = None
    discount_amount: float = 0.0
    status: str = "pending"  # pending, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

# Coupon Models
class Coupon(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    discount_type: str  # percentage or fixed
    discount_value: float
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    expires_at: Optional[datetime] = None

class CouponCreate(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    is_active: bool = True
    expires_at: Optional[datetime] = None

class CouponUpdate(BaseModel):
    code: Optional[str] = None
    discount_type: Optional[str] = None
    discount_value: Optional[float] = None
    is_active: Optional[bool] = None
    expires_at: Optional[datetime] = None

class GenerateResponse(BaseModel):
    title: str
    content: str

# Admin authentication
@api_router.post("/admin/login")
async def admin_login(login: AdminLogin):
    stored_username = os.environ.get('ADMIN_USERNAME', 'admin')
    stored_password = os.environ.get('ADMIN_PASSWORD', 'apebrain2024')
    
    if login.username == stored_username and login.password == stored_password:
        return {"success": True, "message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Get admin settings
@api_router.get("/admin/settings")
async def get_admin_settings():
    return {
        "admin_username": os.environ.get('ADMIN_USERNAME', 'admin')
    }

# Update admin settings
@api_router.post("/admin/settings")
async def update_admin_settings(settings: AdminSettingsUpdate):
    # Verify current password
    stored_password = os.environ.get('ADMIN_PASSWORD', 'apebrain2024')
    if settings.current_password != stored_password:
        raise HTTPException(status_code=401, detail="Current password is incorrect")
    
    # Update .env file
    env_path = ROOT_DIR / '.env'
    env_content = env_path.read_text()
    
    # Update username
    if 'ADMIN_USERNAME=' in env_content:
        env_content = re.sub(r'ADMIN_USERNAME=.*', f'ADMIN_USERNAME=\"{settings.admin_username}\"', env_content)
    else:
        env_content += f'\nADMIN_USERNAME=\"{settings.admin_username}\"'
    
    # Update password if provided
    if settings.new_password:
        if 'ADMIN_PASSWORD=' in env_content:
            env_content = re.sub(r'ADMIN_PASSWORD=.*', f'ADMIN_PASSWORD=\"{settings.new_password}\"', env_content)
        else:
            env_content += f'\nADMIN_PASSWORD=\"{settings.new_password}\"'
    
    env_path.write_text(env_content)
    
    # Reload environment variables
    load_dotenv(ROOT_DIR / '.env', override=True)
    
    return {"success": True, "message": "Settings updated successfully"}

# Get landing page settings (button visibility)
@api_router.get("/landing-settings")
async def get_landing_settings():
    try:
        settings = await db.settings.find_one({"type": "landing_page"}, {"_id": 0})
        if not settings:
            # Return defaults
            return {
                "show_blog": True,
                "show_shop": True,
                "show_minigames": True
            }
        return settings
    except Exception as e:
        logging.error(f"Error fetching landing settings: {str(e)}")
        # Return defaults on error
        return {
            "show_blog": True,
            "show_shop": True,
            "show_minigames": True
        }

# Update landing page settings (button visibility)
@api_router.post("/landing-settings")
async def update_landing_settings(settings: dict):
    try:
        settings_doc = {
            "type": "landing_page",
            "show_blog": settings.get("show_blog", True),
            "show_shop": settings.get("show_shop", True),
            "show_minigames": settings.get("show_minigames", True)
        }
        
        await db.settings.update_one(
            {"type": "landing_page"},
            {"$set": settings_doc},
            upsert=True
        )
        
        return {"success": True, "message": "Landing page settings updated successfully"}
    except Exception as e:
        logging.error(f"Error updating landing settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update landing settings")

# Get blog feature settings
@api_router.get("/blog-features")
async def get_blog_features():
    try:
        settings = await db.settings.find_one({"type": "blog_features"}, {"_id": 0})
        if not settings:
            # Return defaults
            return {
                "enable_video": True,
                "enable_audio": True,
                "enable_text_to_speech": True
            }
        return settings
    except Exception as e:
        logging.error(f"Error fetching blog features: {str(e)}")
        return {
            "enable_video": True,
            "enable_audio": True,
            "enable_text_to_speech": True
        }

# Update blog feature settings
@api_router.post("/blog-features")
async def update_blog_features(settings: dict):
    try:
        settings_doc = {
            "type": "blog_features",
            "enable_video": settings.get("enable_video", True),
            "enable_audio": settings.get("enable_audio", True),
            "enable_text_to_speech": settings.get("enable_text_to_speech", True)
        }
        
        await db.settings.update_one(
            {"type": "blog_features"},
            {"$set": settings_doc},
            upsert=True
        )
        
        return {"success": True, "message": "Blog features updated successfully"}
    except Exception as e:
        logging.error(f"Error updating blog features: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update blog features")

# Generate blog post with AI
@api_router.post("/blogs/generate", response_model=GenerateResponse)
async def generate_blog(input: BlogPostCreate):
    try:
        gemini_api_key = os.environ.get('GEMINI_API_KEY')
        
        # Generate blog content using Gemini Flash Lite
        chat = LlmChat(
            api_key=gemini_api_key,
            session_id=f"blog-gen-{uuid.uuid4()}",
            system_message="You are an expert writer specializing in health, nature, consciousness, spirituality, and holistic wellness. Write engaging, informative blog posts that are SEO-friendly and educational. Cover topics like natural remedies, mindfulness, nutrition, herbal medicine, sustainable living, and personal growth. Focus on scientific facts when available, practical applications, and inspiring content."
        ).with_model("gemini", "gemini-2.0-flash-lite")
        
        user_message = UserMessage(
            text=f"Write a comprehensive blog post about: {input.keywords}. Include an engaging title, detailed content with sections covering the main topic, benefits, scientific research (if applicable), practical applications, and important considerations. Make it around 800-1200 words. Format with proper headings using markdown. Be creative and informative."
        )
        
        blog_content = await chat.send_message(user_message)
        
        # Extract title from content (first line)
        lines = blog_content.strip().split('\n')
        title = lines[0].replace('#', '').strip() if lines else input.keywords
        content = '\n'.join(lines[1:]).strip() if len(lines) > 1 else blog_content
        
        return GenerateResponse(
            title=title,
            content=content
        )
    except Exception as e:
        logging.error(f"Error generating blog: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate blog: {str(e)}")

# Upload image for blog
@api_router.post("/blogs/{blog_id}/upload-image")
async def upload_blog_image(blog_id: str, file: UploadFile = File(...)):
    try:
        # Read file content
        contents = await file.read()
        
        # Convert to base64 for storage
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_url = f"data:image/{file.content_type.split('/')[-1]};base64,{image_base64}"
        
        # Update blog with image
        result = await db.blogs.update_one(
            {"id": blog_id},
            {"$set": {"image_url": image_url}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return {"success": True, "image_url": image_url}
    except Exception as e:
        logging.error(f"Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload image")

# Upload image for product
@api_router.post("/products/{product_id}/upload-image")
async def upload_product_image(product_id: str, file: UploadFile = File(...)):
    try:
        # Read file content
        contents = await file.read()
        
        # Convert to base64 for storage
        image_base64 = base64.b64encode(contents).decode('utf-8')
        image_url = f"data:image/{file.content_type.split('/')[-1]};base64,{image_base64}"
        
        # Update product with image
        result = await db.products.update_one(
            {"id": product_id},
            {"$set": {"image_url": image_url}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"success": True, "image_url": image_url}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error uploading product image: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload product image")

# Upload audio for blog
@api_router.post("/blogs/{blog_id}/upload-audio")
async def upload_blog_audio(blog_id: str, file: UploadFile = File(...)):
    try:
        # Read file content
        contents = await file.read()
        
        # Convert to base64 for storage
        audio_base64 = base64.b64encode(contents).decode('utf-8')
        # Determine audio type
        content_type = file.content_type or 'audio/mpeg'
        audio_url = f"data:{content_type};base64,{audio_base64}"
        
        # Update blog with audio
        result = await db.blogs.update_one(
            {"id": blog_id},
            {"$set": {"audio_url": audio_url}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return {"success": True, "audio_url": audio_url}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error uploading audio: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload audio")

# Fetch image from web based on keywords
@api_router.get("/fetch-image")
async def fetch_image_from_web(keywords: str):
    try:
        # Use Unsplash Source API with proper format
        search_query = keywords.replace(" ", ",")
        image_url = f"https://source.unsplash.com/800x600/?{search_query}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(image_url, follow_redirects=True)
            
            if response.status_code == 200:
                # Convert image to base64
                image_base64 = base64.b64encode(response.content).decode('utf-8')
                image_data_url = f"data:image/jpeg;base64,{image_base64}"
                return {"success": True, "image_url": image_data_url}
            else:
                # Fallback to a nature image
                fallback_url = "https://source.unsplash.com/800x600/?nature,mushroom"
                fallback_response = await client.get(fallback_url, follow_redirects=True)
                if fallback_response.status_code == 200:
                    image_base64 = base64.b64encode(fallback_response.content).decode('utf-8')
                    image_data_url = f"data:image/jpeg;base64,{image_base64}"
                    return {"success": True, "image_url": image_data_url}
                else:
                    raise HTTPException(status_code=404, detail="No image found")
    except Exception as e:
        logging.error(f"Error fetching image from web: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch image from web: {str(e)}")

# Create/Save blog post
@api_router.post("/blogs", response_model=BlogPost)
async def create_blog(blog: BlogPost):
    try:
        doc = blog.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        if doc['published_at']:
            doc['published_at'] = doc['published_at'].isoformat()
        
        await db.blogs.insert_one(doc)
        return blog
    except Exception as e:
        logging.error(f"Error creating blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create blog")

# Get all published blogs (public)
@api_router.get("/blogs", response_model=List[BlogPost])
async def get_blogs(status: Optional[str] = "published"):
    try:
        query = {"status": status} if status else {}
        blogs = await db.blogs.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        for blog in blogs:
            if isinstance(blog.get('created_at'), str):
                blog['created_at'] = datetime.fromisoformat(blog['created_at'])
            if blog.get('published_at') and isinstance(blog['published_at'], str):
                blog['published_at'] = datetime.fromisoformat(blog['published_at'])
        
        return blogs
    except Exception as e:
        logging.error(f"Error fetching blogs: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch blogs")

# Get single blog
@api_router.get("/blogs/{blog_id}", response_model=BlogPost)
async def get_blog(blog_id: str):
    try:
        blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
        if not blog:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        if isinstance(blog.get('created_at'), str):
            blog['created_at'] = datetime.fromisoformat(blog['created_at'])
        if blog.get('published_at') and isinstance(blog['published_at'], str):
            blog['published_at'] = datetime.fromisoformat(blog['published_at'])
        
        return blog
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch blog")

# Update blog
@api_router.put("/blogs/{blog_id}", response_model=BlogPost)
async def update_blog(blog_id: str, update: BlogPostUpdate):
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.blogs.update_one(
            {"id": blog_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        blog = await db.blogs.find_one({"id": blog_id}, {"_id": 0})
        
        if isinstance(blog.get('created_at'), str):
            blog['created_at'] = datetime.fromisoformat(blog['created_at'])
        if blog.get('published_at') and isinstance(blog['published_at'], str):
            blog['published_at'] = datetime.fromisoformat(blog['published_at'])
        
        return blog
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update blog")

# Publish blog
@api_router.post("/blogs/{blog_id}/publish")
async def publish_blog(blog_id: str):
    try:
        result = await db.blogs.update_one(
            {"id": blog_id},
            {"$set": {
                "status": "published",
                "published_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return {"success": True, "message": "Blog published successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error publishing blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to publish blog")

# Delete blog
@api_router.delete("/blogs/{blog_id}")
async def delete_blog(blog_id: str):
    try:
        result = await db.blogs.delete_one({"id": blog_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Blog not found")
        
        return {"success": True, "message": "Blog deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting blog: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete blog")

# ============= SHOP & PAYPAL ENDPOINTS =============

# Create PayPal order
@api_router.post("/shop/create-order")
async def create_shop_order(order: CreateOrder):
    try:
        if not os.environ.get('PAYPAL_CLIENT_ID'):
            raise HTTPException(status_code=500, detail="PayPal not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to .env file")
        
        # Validate and apply coupon if provided
        discount_amount = 0.0
        if order.coupon_code:
            try:
                coupon = await db.coupons.find_one({"code": order.coupon_code.upper(), "is_active": True}, {"_id": 0})
                if coupon:
                    subtotal = order.total
                    if coupon['discount_type'] == 'percentage':
                        discount_amount = (subtotal * coupon['discount_value']) / 100
                    else:
                        discount_amount = coupon['discount_value']
                    
                    # Apply discount
                    order.total = max(0, order.total - discount_amount)
            except Exception as e:
                logging.warning(f"Could not apply coupon: {str(e)}")
        
        # Create PayPal payment
        payment = paypalrestsdk.Payment({
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment/success",
                "cancel_url": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment/cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [
                        {
                            "name": item.name,
                            "sku": item.product_id,
                            "price": f"{item.price:.2f}",
                            "currency": "USD",
                            "quantity": item.quantity
                        } for item in order.items
                    ]
                },
                "amount": {
                    "total": f"{order.total:.2f}",
                    "currency": "USD"
                },
                "description": "ApeBrain.cloud Shop Purchase"
            }]
        })

        if payment.create():
            # Save order to database
            order_doc = {
                "id": str(uuid.uuid4()),
                "payment_id": payment.id,
                "items": [item.dict() for item in order.items],
                "total": order.total,
                "customer_email": order.customer_email,
                "coupon_code": order.coupon_code,
                "discount_amount": round(discount_amount, 2),
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.orders.insert_one(order_doc)
            
            # Get approval URL
            approval_url = None
            for link in payment.links:
                if link.rel == "approval_url":
                    approval_url = link.href
                    break
            
            return {
                "success": True,
                "approval_url": approval_url,
                "order_id": order_doc["id"],
                "payment_id": payment.id
            }
        else:
            logging.error(f"PayPal payment creation failed: {payment.error}")
            raise HTTPException(status_code=400, detail=f"Payment creation failed: {payment.error}")
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

# Execute PayPal payment
@api_router.post("/shop/execute-payment")
async def execute_payment(payment_id: str, payer_id: str):
    try:
        payment = paypalrestsdk.Payment.find(payment_id)
        
        if payment.execute({"payer_id": payer_id}):
            # Update order status
            result = await db.orders.update_one(
                {"payment_id": payment_id},
                {"$set": {
                    "status": "completed",
                    "payer_id": payer_id,
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            if result.matched_count == 0:
                logging.warning(f"Order not found for payment_id: {payment_id}")
            
            return {
                "success": True,
                "message": "Payment completed successfully",
                "payment_id": payment_id
            }
        else:
            logging.error(f"Payment execution failed: {payment.error}")
            raise HTTPException(status_code=400, detail=f"Payment execution failed: {payment.error}")
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error executing payment: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to execute payment: {str(e)}")

# Get order details
@api_router.get("/shop/orders/{order_id}")
async def get_order(order_id: str):
    try:
        order = await db.orders.find_one({"id": order_id}, {"_id": 0})
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching order: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch order")

# Get all orders (admin)
@api_router.get("/shop/orders")
async def get_all_orders():
    try:
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return orders
    except Exception as e:
        logging.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders")

# ============= COUPON ENDPOINTS =============

# Get active coupon (public)
@api_router.get("/coupons/active")
async def get_active_coupon():
    try:
        coupon = await db.coupons.find_one({"is_active": True}, {"_id": 0})
        if coupon:
            if isinstance(coupon.get('created_at'), str):
                coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
            if coupon.get('expires_at') and isinstance(coupon['expires_at'], str):
                coupon['expires_at'] = datetime.fromisoformat(coupon['expires_at'])
        return coupon
    except Exception as e:
        logging.error(f"Error fetching active coupon: {str(e)}")
        return None

# Validate coupon
@api_router.post("/coupons/validate")
async def validate_coupon(code: str, subtotal: float):
    try:
        coupon = await db.coupons.find_one({"code": code.upper(), "is_active": True}, {"_id": 0})
        
        if not coupon:
            raise HTTPException(status_code=404, detail="Invalid coupon code")
        
        # Check expiration
        if coupon.get('expires_at'):
            expires = datetime.fromisoformat(coupon['expires_at']) if isinstance(coupon['expires_at'], str) else coupon['expires_at']
            if expires < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Coupon has expired")
        
        # Calculate discount
        discount = 0
        if coupon['discount_type'] == 'percentage':
            discount = (subtotal * coupon['discount_value']) / 100
        else:  # fixed
            discount = coupon['discount_value']
        
        return {
            "valid": True,
            "discount_amount": round(discount, 2),
            "discount_type": coupon['discount_type'],
            "discount_value": coupon['discount_value'],
            "code": coupon['code']
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error validating coupon: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to validate coupon")

# Create coupon (admin)
@api_router.post("/coupons")
async def create_coupon(coupon: CouponCreate):
    try:
        # Check if code already exists
        existing = await db.coupons.find_one({"code": coupon.code.upper()})
        if existing:
            raise HTTPException(status_code=400, detail="Coupon code already exists")
        
        coupon_id = str(uuid.uuid4())
        doc = {
            "id": coupon_id,
            "code": coupon.code.upper(),
            "discount_type": coupon.discount_type,
            "discount_value": coupon.discount_value,
            "is_active": coupon.is_active,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": coupon.expires_at.isoformat() if coupon.expires_at else None
        }
        
        await db.coupons.insert_one(doc)
        
        # Return without MongoDB _id
        return {
            "id": coupon_id,
            "code": doc["code"],
            "discount_type": doc["discount_type"],
            "discount_value": doc["discount_value"],
            "is_active": doc["is_active"],
            "created_at": doc["created_at"],
            "expires_at": doc["expires_at"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating coupon: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create coupon: {str(e)}")

# Get all coupons (admin)
@api_router.get("/coupons")
async def get_all_coupons():
    try:
        coupons = await db.coupons.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        for coupon in coupons:
            if isinstance(coupon.get('created_at'), str):
                coupon['created_at'] = datetime.fromisoformat(coupon['created_at'])
            if coupon.get('expires_at') and isinstance(coupon['expires_at'], str):
                coupon['expires_at'] = datetime.fromisoformat(coupon['expires_at'])
        return coupons
    except Exception as e:
        logging.error(f"Error fetching coupons: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch coupons")

# Update coupon (admin)
@api_router.put("/coupons/{coupon_id}")
async def update_coupon(coupon_id: str, update: CouponUpdate):
    try:
        update_data = {k: v for k, v in update.model_dump().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        # If code is being updated, check uniqueness
        if 'code' in update_data:
            update_data['code'] = update_data['code'].upper()
            existing = await db.coupons.find_one({"code": update_data['code'], "id": {"$ne": coupon_id}})
            if existing:
                raise HTTPException(status_code=400, detail="Coupon code already exists")
        
        # Convert datetime to string if present
        if 'expires_at' in update_data and update_data['expires_at']:
            update_data['expires_at'] = update_data['expires_at'].isoformat()
        
        result = await db.coupons.update_one(
            {"id": coupon_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        coupon = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
        return coupon
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating coupon: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update coupon")

# Delete coupon (admin)
@api_router.delete("/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str):
    try:
        result = await db.coupons.delete_one({"id": coupon_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Coupon not found")
        
        return {"success": True, "message": "Coupon deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting coupon: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete coupon")

# ============= PRODUCT MANAGEMENT ENDPOINTS =============

# Get all products
@api_router.get("/products")
async def get_products():
    try:
        # For now, return hardcoded products (can be made dynamic later)
        products = [
            {"id": "phys-1", "name": "Lion's Mane Extract", "price": 29.99, "description": "Premium quality Lion's Mane mushroom extract for cognitive support", "category": "Supplements", "type": "physical"},
            {"id": "phys-2", "name": "Reishi Capsules", "price": 24.99, "description": "Pure Reishi mushroom capsules for immune system support", "category": "Supplements", "type": "physical"},
            {"id": "phys-3", "name": "Mushroom Growing Kit", "price": 49.99, "description": "Complete kit to grow your own gourmet mushrooms at home", "category": "Kits", "type": "physical"},
            {"id": "phys-4", "name": "Cordyceps Powder", "price": 34.99, "description": "Organic Cordyceps mushroom powder for energy and vitality", "category": "Supplements", "type": "physical"},
            {"id": "digi-1", "name": "Mushroom Identification Guide", "price": 19.99, "description": "Comprehensive digital guide to identifying edible mushrooms", "category": "eBooks", "type": "digital"},
            {"id": "digi-2", "name": "Holistic Health Course", "price": 79.99, "description": "Complete online course on natural wellness and mushroom medicine", "category": "Courses", "type": "digital"},
            {"id": "digi-3", "name": "Meditation & Consciousness Pack", "price": 29.99, "description": "Guided meditations and consciousness expansion exercises", "category": "Audio", "type": "digital"}
        ]
        
        # Also get from database
        db_products = await db.products.find({}, {"_id": 0}).to_list(1000)
        
        # Merge with hardcoded (avoid duplicates by ID)
        existing_ids = [p["id"] for p in db_products]
        for prod in products:
            if prod["id"] not in existing_ids:
                db_products.append(prod)
        
        return db_products
    except Exception as e:
        logging.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch products")

# Create product
@api_router.post("/products")
async def create_product(product: dict):
    try:
        # Ensure _id is not in the product dict
        if "_id" in product:
            del product["_id"]
        
        await db.products.insert_one(product)
        
        # Return without MongoDB _id
        return {k: v for k, v in product.items() if k != "_id"}
    except Exception as e:
        logging.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create product: {str(e)}")

# Update product
@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product: dict):
    try:
        result = await db.products.update_one(
            {"id": product_id},
            {"$set": product}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update product")

# Delete product
@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    try:
        result = await db.products.delete_one({"id": product_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"success": True, "message": "Product deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting product: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete product")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()