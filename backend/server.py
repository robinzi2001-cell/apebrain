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
    status: str = "draft"  # draft or published
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published_at: Optional[datetime] = None

class BlogPostCreate(BaseModel):
    keywords: str

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    keywords: Optional[str] = None
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

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_id: Optional[str] = None
    items: List[dict]
    total: float
    customer_email: str
    status: str = "pending"  # pending, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None

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