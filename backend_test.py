import requests
import sys
import json
from datetime import datetime
import time
import base64
import io

class MushroomBlogAPITester:
    def __init__(self, base_url="https://blog-shop-combo.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_blog_id = None
        self.test_product_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timed out after {timeout} seconds")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login_valid(self):
        """Test admin login with valid password"""
        success, response = self.run_test(
            "Admin Login (Valid Password)",
            "POST",
            "admin/login",
            200,
            data={"password": "apebrain2024"}
        )
        return success and response.get('success') == True

    def test_admin_login_invalid(self):
        """Test admin login with invalid password"""
        success, response = self.run_test(
            "Admin Login (Invalid Password)",
            "POST", 
            "admin/login",
            401,
            data={"password": "wrongpassword"}
        )
        return success

    def test_generate_blog(self):
        """Test AI blog generation - this may take 30-60 seconds"""
        print("\n⚠️  AI Generation Test - This may take 30-60 seconds...")
        success, response = self.run_test(
            "Generate Blog with AI",
            "POST",
            "blogs/generate",
            200,
            data={"keywords": "Reishi mushroom benefits"},
            timeout=120  # Extended timeout for AI generation
        )
        
        if success:
            # Verify response structure
            required_fields = ['title', 'content', 'image_base64']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing required field: {field}")
                    return False
                elif not response[field]:
                    print(f"❌ Empty required field: {field}")
                    return False
            
            print(f"✅ Generated blog title: {response['title'][:50]}...")
            print(f"✅ Generated content length: {len(response['content'])} characters")
            print(f"✅ Generated image: {'Yes' if response['image_base64'] else 'No'}")
            
            # Store for later tests
            self.generated_blog = response
            return True
        
        return False

    def test_create_blog(self):
        """Test creating/saving a blog post"""
        if not hasattr(self, 'generated_blog'):
            print("❌ Cannot test blog creation - no generated blog available")
            return False
            
        blog_data = {
            "id": f"test-blog-{int(time.time())}",
            "title": self.generated_blog['title'],
            "content": self.generated_blog['content'],
            "keywords": "Reishi mushroom benefits",
            "image_base64": self.generated_blog['image_base64'],
            "status": "draft"
        }
        
        success, response = self.run_test(
            "Create Blog Post",
            "POST",
            "blogs",
            200,
            data=blog_data
        )
        
        if success and response.get('id'):
            self.test_blog_id = response['id']
            print(f"✅ Created blog with ID: {self.test_blog_id}")
            return True
        
        return False

    def test_get_blogs(self):
        """Test fetching all blogs"""
        success, response = self.run_test(
            "Get All Blogs",
            "GET",
            "blogs",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} published blogs")
            return True
        
        return False

    def test_get_single_blog(self):
        """Test fetching a single blog"""
        if not self.test_blog_id:
            print("❌ Cannot test single blog fetch - no blog ID available")
            return False
            
        success, response = self.run_test(
            "Get Single Blog",
            "GET",
            f"blogs/{self.test_blog_id}",
            200
        )
        
        if success and response.get('id') == self.test_blog_id:
            print(f"✅ Successfully fetched blog: {response['title'][:50]}...")
            return True
        
        return False

    def test_publish_blog(self):
        """Test publishing a blog"""
        if not self.test_blog_id:
            print("❌ Cannot test blog publishing - no blog ID available")
            return False
            
        success, response = self.run_test(
            "Publish Blog",
            "POST",
            f"blogs/{self.test_blog_id}/publish",
            200
        )
        
        if success and response.get('success'):
            print("✅ Blog published successfully")
            return True
        
        return False

    def test_delete_blog(self):
        """Test deleting a blog"""
        if not self.test_blog_id:
            print("❌ Cannot test blog deletion - no blog ID available")
            return False
            
        success, response = self.run_test(
            "Delete Blog",
            "DELETE",
            f"blogs/{self.test_blog_id}",
            200
        )
        
        if success and response.get('success'):
            print("✅ Blog deleted successfully")
            return True
        
        return False

    def create_test_image_data(self):
        """Create a small test image in base64 format"""
        # Create a simple 1x1 pixel PNG image
        png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0cIDATx\x9cc```\x00\x00\x00\x04\x00\x01\xdd\x8d\xb4\x1c\x00\x00\x00\x00IEND\xaeB`\x82'
        return png_data

    def run_multipart_test(self, name, endpoint, expected_status, file_data, timeout=30, file_type='image'):
        """Run a multipart file upload test"""
        url = f"{self.api_url}/{endpoint}"
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if file_type == 'audio':
                files = {'file': ('test_audio.mp3', file_data, 'audio/mpeg')}
            else:
                files = {'file': ('test_image.png', file_data, 'image/png')}
            
            response = requests.post(url, files=files, timeout=timeout)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timed out after {timeout} seconds")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_products(self):
        """Test fetching all products"""
        success, response = self.run_test(
            "Get All Products",
            "GET",
            "products",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} products")
            # Check if products have expected structure
            if response and len(response) > 0:
                product = response[0]
                required_fields = ['id', 'name', 'price', 'description', 'category', 'type']
                for field in required_fields:
                    if field not in product:
                        print(f"❌ Missing required field in product: {field}")
                        return False
            return True
        
        return False

    def test_create_product(self):
        """Test creating a new product"""
        product_data = {
            "id": f"test-product-{int(time.time())}",
            "name": "Test Lion's Mane Extract",
            "price": 39.99,
            "description": "Premium test Lion's Mane mushroom extract for cognitive enhancement",
            "category": "Test Supplements",
            "type": "physical"
        }
        
        success, response = self.run_test(
            "Create Product",
            "POST",
            "products",
            200,
            data=product_data
        )
        
        if success and response.get('id'):
            self.test_product_id = response['id']
            print(f"✅ Created product with ID: {self.test_product_id}")
            return True
        
        return False

    def test_upload_product_image(self):
        """Test uploading an image to a product"""
        if not self.test_product_id:
            print("❌ Cannot test product image upload - no product ID available")
            return False
            
        # Create test image data
        image_data = self.create_test_image_data()
        
        success, response = self.run_multipart_test(
            "Upload Product Image",
            f"products/{self.test_product_id}/upload-image",
            200,
            image_data
        )
        
        if success and response.get('success') and response.get('image_url'):
            print(f"✅ Image uploaded successfully")
            # Verify image_url format
            image_url = response['image_url']
            if image_url.startswith('data:image/') and 'base64,' in image_url:
                print(f"✅ Image URL format is correct: {image_url[:50]}...")
                return True
            else:
                print(f"❌ Invalid image URL format: {image_url}")
                return False
        
        return False

    def test_get_products_with_images(self):
        """Test fetching products and verify image URLs are included"""
        success, response = self.run_test(
            "Get Products with Images",
            "GET",
            "products",
            200
        )
        
        if success:
            # Find our test product
            test_product = None
            for product in response:
                if product.get('id') == self.test_product_id:
                    test_product = product
                    break
            
            if test_product:
                if 'image_url' in test_product and test_product['image_url']:
                    print(f"✅ Product has image_url: {test_product['image_url'][:50]}...")
                    return True
                else:
                    print("❌ Product missing image_url field")
                    return False
            else:
                print("❌ Test product not found in products list")
                return False
        
        return False

    def test_update_product(self):
        """Test updating a product"""
        if not self.test_product_id:
            print("❌ Cannot test product update - no product ID available")
            return False
            
        update_data = {
            "name": "Updated Test Lion's Mane Extract",
            "price": 44.99,
            "description": "Updated premium test Lion's Mane mushroom extract"
        }
        
        success, response = self.run_test(
            "Update Product",
            "PUT",
            f"products/{self.test_product_id}",
            200,
            data=update_data
        )
        
        if success:
            print("✅ Product updated successfully")
            return True
        
        return False

    def test_upload_image_to_nonexistent_product(self):
        """Test uploading image to non-existent product (error handling)"""
        fake_product_id = "nonexistent-product-123"
        image_data = self.create_test_image_data()
        
        success, response = self.run_multipart_test(
            "Upload Image to Non-existent Product",
            f"products/{fake_product_id}/upload-image",
            404,
            image_data
        )
        
        if success:
            print("✅ Correctly returned 404 for non-existent product")
            return True
        
        return False

    def test_delete_product(self):
        """Test deleting a product"""
        if not self.test_product_id:
            print("❌ Cannot test product deletion - no product ID available")
            return False
            
        success, response = self.run_test(
            "Delete Product",
            "DELETE",
            f"products/{self.test_product_id}",
            200
        )
        
        if success and response.get('success'):
            print("✅ Product deleted successfully")
            return True
        
        return False

    def test_get_default_landing_settings(self):
        """Test getting default landing page settings (first time)"""
        success, response = self.run_test(
            "Get Default Landing Settings",
            "GET",
            "landing-settings",
            200
        )
        
        if success:
            # Verify default values
            expected_defaults = {
                "show_blog": True,
                "show_shop": True,
                "show_minigames": True
            }
            
            for key, expected_value in expected_defaults.items():
                if key not in response:
                    print(f"❌ Missing required field: {key}")
                    return False
                if response[key] != expected_value:
                    print(f"❌ Incorrect default value for {key}: expected {expected_value}, got {response[key]}")
                    return False
            
            print("✅ Default landing settings returned correctly")
            print(f"   show_blog: {response['show_blog']}")
            print(f"   show_shop: {response['show_shop']}")
            print(f"   show_minigames: {response['show_minigames']}")
            return True
        
        return False

    def test_save_landing_settings(self):
        """Test saving landing page settings"""
        settings_data = {
            "show_blog": False,
            "show_shop": True,
            "show_minigames": False
        }
        
        success, response = self.run_test(
            "Save Landing Settings",
            "POST",
            "landing-settings",
            200,
            data=settings_data
        )
        
        if success and response.get('success'):
            print("✅ Landing settings saved successfully")
            print(f"   Message: {response.get('message', 'No message')}")
            return True
        
        return False

    def test_get_saved_landing_settings(self):
        """Test getting saved landing page settings"""
        success, response = self.run_test(
            "Get Saved Landing Settings",
            "GET",
            "landing-settings",
            200
        )
        
        if success:
            # Verify saved values match what we posted
            expected_values = {
                "show_blog": False,
                "show_shop": True,
                "show_minigames": False
            }
            
            for key, expected_value in expected_values.items():
                if key not in response:
                    print(f"❌ Missing required field: {key}")
                    return False
                if response[key] != expected_value:
                    print(f"❌ Incorrect saved value for {key}: expected {expected_value}, got {response[key]}")
                    return False
            
            print("✅ Saved landing settings returned correctly")
            print(f"   show_blog: {response['show_blog']}")
            print(f"   show_shop: {response['show_shop']}")
            print(f"   show_minigames: {response['show_minigames']}")
            return True
        
        return False

    def test_update_landing_settings(self):
        """Test updating landing page settings (all true)"""
        settings_data = {
            "show_blog": True,
            "show_shop": True,
            "show_minigames": True
        }
        
        success, response = self.run_test(
            "Update Landing Settings (All True)",
            "POST",
            "landing-settings",
            200,
            data=settings_data
        )
        
        if success and response.get('success'):
            print("✅ Landing settings updated successfully")
            print(f"   Message: {response.get('message', 'No message')}")
            return True
        
        return False

    def test_verify_updated_landing_settings(self):
        """Test verifying updated landing page settings"""
        success, response = self.run_test(
            "Verify Updated Landing Settings",
            "GET",
            "landing-settings",
            200
        )
        
        if success:
            # Verify all values are now true
            expected_values = {
                "show_blog": True,
                "show_shop": True,
                "show_minigames": True
            }
            
            for key, expected_value in expected_values.items():
                if key not in response:
                    print(f"❌ Missing required field: {key}")
                    return False
                if response[key] != expected_value:
                    print(f"❌ Incorrect updated value for {key}: expected {expected_value}, got {response[key]}")
                    return False
            
            print("✅ Updated landing settings verified correctly")
            print(f"   show_blog: {response['show_blog']}")
            print(f"   show_shop: {response['show_shop']}")
            print(f"   show_minigames: {response['show_minigames']}")
            return True
        
        return False

    def test_get_default_blog_features(self):
        """Test getting default blog feature settings (first time)"""
        success, response = self.run_test(
            "Get Default Blog Features",
            "GET",
            "blog-features",
            200
        )
        
        if success:
            # Verify default values
            expected_defaults = {
                "enable_video": True,
                "enable_audio": True,
                "enable_text_to_speech": True
            }
            
            for key, expected_value in expected_defaults.items():
                if key not in response:
                    print(f"❌ Missing required field: {key}")
                    return False
                if response[key] != expected_value:
                    print(f"❌ Incorrect default value for {key}: expected {expected_value}, got {response[key]}")
                    return False
            
            print("✅ Default blog features returned correctly")
            print(f"   enable_video: {response['enable_video']}")
            print(f"   enable_audio: {response['enable_audio']}")
            print(f"   enable_text_to_speech: {response['enable_text_to_speech']}")
            return True
        
        return False

    def test_save_blog_features(self):
        """Test saving blog feature settings"""
        settings_data = {
            "enable_video": False,
            "enable_audio": True,
            "enable_text_to_speech": False
        }
        
        success, response = self.run_test(
            "Save Blog Features",
            "POST",
            "blog-features",
            200,
            data=settings_data
        )
        
        if success and response.get('success'):
            print("✅ Blog features saved successfully")
            print(f"   Message: {response.get('message', 'No message')}")
            return True
        
        return False

    def test_get_saved_blog_features(self):
        """Test getting saved blog feature settings"""
        success, response = self.run_test(
            "Get Saved Blog Features",
            "GET",
            "blog-features",
            200
        )
        
        if success:
            # Verify saved values match what we posted
            expected_values = {
                "enable_video": False,
                "enable_audio": True,
                "enable_text_to_speech": False
            }
            
            for key, expected_value in expected_values.items():
                if key not in response:
                    print(f"❌ Missing required field: {key}")
                    return False
                if response[key] != expected_value:
                    print(f"❌ Incorrect saved value for {key}: expected {expected_value}, got {response[key]}")
                    return False
            
            print("✅ Saved blog features returned correctly")
            print(f"   enable_video: {response['enable_video']}")
            print(f"   enable_audio: {response['enable_audio']}")
            print(f"   enable_text_to_speech: {response['enable_text_to_speech']}")
            return True
        
        return False

    def create_test_audio_data(self):
        """Create a small test audio file in MP3 format"""
        # Create a minimal MP3 header (not a real MP3, but enough for testing)
        mp3_header = b'\xff\xfb\x90\x00' + b'\x00' * 100  # Minimal MP3-like data
        return mp3_header

    def test_create_blog_with_video_url(self):
        """Test creating a blog post with video_url field"""
        blog_data = {
            "id": f"test-video-blog-{int(time.time())}",
            "title": "Test Blog with Video",
            "content": "This is a test blog post with a YouTube video embedded.",
            "keywords": "test video blog",
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "status": "draft"
        }
        
        success, response = self.run_test(
            "Create Blog with Video URL",
            "POST",
            "blogs",
            200,
            data=blog_data
        )
        
        if success and response.get('id'):
            self.test_video_blog_id = response['id']
            print(f"✅ Created blog with video URL, ID: {self.test_video_blog_id}")
            
            # Verify video_url is stored correctly
            if response.get('video_url') == blog_data['video_url']:
                print(f"✅ Video URL stored correctly: {response['video_url']}")
                return True
            else:
                print(f"❌ Video URL not stored correctly. Expected: {blog_data['video_url']}, Got: {response.get('video_url')}")
                return False
        
        return False

    def test_get_blog_with_video_url(self):
        """Test fetching a blog with video_url field"""
        if not hasattr(self, 'test_video_blog_id'):
            print("❌ Cannot test blog with video URL fetch - no video blog ID available")
            return False
            
        success, response = self.run_test(
            "Get Blog with Video URL",
            "GET",
            f"blogs/{self.test_video_blog_id}",
            200
        )
        
        if success and response.get('id') == self.test_video_blog_id:
            if response.get('video_url'):
                print(f"✅ Successfully fetched blog with video URL: {response['video_url']}")
                return True
            else:
                print("❌ Blog missing video_url field")
                return False
        
        return False

    def test_upload_blog_audio(self):
        """Test uploading an audio file to a blog"""
        if not hasattr(self, 'test_video_blog_id'):
            print("❌ Cannot test blog audio upload - no blog ID available")
            return False
            
        # Create test audio data
        audio_data = self.create_test_audio_data()
        
        success, response = self.run_multipart_test(
            "Upload Blog Audio",
            f"blogs/{self.test_video_blog_id}/upload-audio",
            200,
            audio_data,
            file_type='audio'
        )
        
        if success and response.get('success') and response.get('audio_url'):
            print(f"✅ Audio uploaded successfully")
            # Verify audio_url format
            audio_url = response['audio_url']
            if audio_url.startswith('data:audio/') and 'base64,' in audio_url:
                print(f"✅ Audio URL format is correct: {audio_url[:50]}...")
                return True
            else:
                print(f"❌ Invalid audio URL format: {audio_url}")
                return False
        
        return False

    def test_get_blog_with_audio_url(self):
        """Test fetching a blog with audio_url field after upload"""
        if not hasattr(self, 'test_video_blog_id'):
            print("❌ Cannot test blog with audio URL fetch - no blog ID available")
            return False
            
        success, response = self.run_test(
            "Get Blog with Audio URL",
            "GET",
            f"blogs/{self.test_video_blog_id}",
            200
        )
        
        if success and response.get('id') == self.test_video_blog_id:
            if response.get('audio_url'):
                print(f"✅ Successfully fetched blog with audio URL: {response['audio_url'][:50]}...")
                return True
            else:
                print("❌ Blog missing audio_url field after upload")
                return False
        
        return False

    def test_upload_audio_to_nonexistent_blog(self):
        """Test uploading audio to non-existent blog (error handling)"""
        fake_blog_id = "nonexistent-blog-123"
        audio_data = self.create_test_audio_data()
        
        success, response = self.run_multipart_test(
            "Upload Audio to Non-existent Blog",
            f"blogs/{fake_blog_id}/upload-audio",
            404,
            audio_data
        )
        
        if success:
            print("✅ Correctly returned 404 for non-existent blog")
            return True
        
        return False

    def test_cleanup_test_video_blog(self):
        """Test deleting the test video blog"""
        if not hasattr(self, 'test_video_blog_id'):
            print("❌ Cannot test video blog deletion - no blog ID available")
            return False
            
        success, response = self.run_test(
            "Delete Test Video Blog",
            "DELETE",
            f"blogs/{self.test_video_blog_id}",
            200
        )
        
        if success and response.get('success'):
            print("✅ Test video blog deleted successfully")
            return True
        
        return False

def main():
    print("🍄 Starting Mushroom Blog API Tests")
    print("=" * 50)
    
    tester = MushroomBlogAPITester()
    
    # Test sequence - Blog Multimedia Features Tests (High Priority)
    tests = [
        # Blog Feature Settings Tests
        ("Get Default Blog Features", tester.test_get_default_blog_features),
        ("Save Blog Features", tester.test_save_blog_features),
        ("Get Saved Blog Features", tester.test_get_saved_blog_features),
        
        # Blog with Video URL Tests
        ("Create Blog with Video URL", tester.test_create_blog_with_video_url),
        ("Get Blog with Video URL", tester.test_get_blog_with_video_url),
        
        # Blog Audio Upload Tests
        ("Upload Blog Audio", tester.test_upload_blog_audio),
        ("Get Blog with Audio URL", tester.test_get_blog_with_audio_url),
        ("Upload Audio to Non-existent Blog", tester.test_upload_audio_to_nonexistent_blog),
        
        # Cleanup
        ("Delete Test Video Blog", tester.test_cleanup_test_video_blog),
        
        # Previous Tests (for completeness)
        ("Get Default Landing Settings", tester.test_get_default_landing_settings),
        ("Save Landing Settings", tester.test_save_landing_settings),
        ("Get Saved Landing Settings", tester.test_get_saved_landing_settings),
        ("Update Landing Settings", tester.test_update_landing_settings),
        ("Verify Updated Landing Settings", tester.test_verify_updated_landing_settings),
        ("Admin Login (Valid)", tester.test_admin_login_valid),
        ("Admin Login (Invalid)", tester.test_admin_login_invalid),
        ("Get All Products", tester.test_get_products),
        ("Create Product", tester.test_create_product),
        ("Upload Product Image", tester.test_upload_product_image),
        ("Get Products with Images", tester.test_get_products_with_images),
        ("Update Product", tester.test_update_product),
        ("Upload Image to Non-existent Product", tester.test_upload_image_to_nonexistent_product),
        ("Delete Product", tester.test_delete_product),
        ("AI Blog Generation", tester.test_generate_blog),
        ("Create Blog Post", tester.test_create_blog),
        ("Get All Blogs", tester.test_get_blogs),
        ("Get Single Blog", tester.test_get_single_blog),
        ("Publish Blog", tester.test_publish_blog),
        ("Delete Blog", tester.test_delete_blog),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {str(e)}")
            results.append((test_name, False))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    print(f"\nOverall: {passed_count}/{total_count} tests passed")
    print(f"Success Rate: {(passed_count/total_count)*100:.1f}%")
    
    return 0 if passed_count == total_count else 1

if __name__ == "__main__":
    sys.exit(main())