import requests
import sys
import json
from datetime import datetime
import time
import base64
import io

class MushroomBlogAPITester:
    def __init__(self, base_url="https://mushroom-blog.preview.emergentagent.com"):
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
        """Test admin login with valid credentials"""
        success, response = self.run_test(
            "Admin Login (Valid Credentials)",
            "POST",
            "admin/login",
            200,
            data={"username": "admin", "password": "apebrain2024"}
        )
        return success and response.get('success') == True

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        success, response = self.run_test(
            "Admin Login (Invalid Credentials)",
            "POST", 
            "admin/login",
            401,
            data={"username": "admin", "password": "wrongpassword"}
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
            audio_data,
            file_type='audio'
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

    def test_fetch_image_good_keywords(self):
        """Test fetching image with good keywords"""
        success, response = self.run_test(
            "Fetch Image with Good Keywords",
            "GET",
            "fetch-image?keywords=forest mushroom",
            200,
            timeout=60  # Extended timeout for image fetch
        )
        
        if success:
            # Verify response structure
            if not response.get('success'):
                print("❌ Response missing success field or success=false")
                return False
            
            image_url = response.get('image_url')
            if not image_url:
                print("❌ Response missing image_url field")
                return False
            
            # Verify base64 format
            if not image_url.startswith('data:image/jpeg;base64,'):
                print(f"❌ Invalid image URL format. Expected 'data:image/jpeg;base64,...', got: {image_url[:50]}...")
                return False
            
            # Verify base64 content exists and is reasonable size
            base64_part = image_url.split('base64,')[1] if 'base64,' in image_url else ''
            if len(base64_part) < 100:  # Very small images would be suspicious
                print(f"❌ Base64 content too small: {len(base64_part)} characters")
                return False
            
            if len(base64_part) > 5000000:  # Very large images (>5MB base64) might be problematic
                print(f"❌ Base64 content too large: {len(base64_part)} characters")
                return False
            
            print(f"✅ Successfully fetched image with good keywords")
            print(f"   Image URL format: {image_url[:50]}...")
            print(f"   Base64 content size: {len(base64_part)} characters")
            return True
        
        return False

    def test_fetch_image_different_keywords(self):
        """Test fetching images with different keywords"""
        test_keywords = ["ocean nature", "mountain landscape", "abstract art"]
        
        for keywords in test_keywords:
            print(f"\n🔍 Testing keywords: '{keywords}'")
            success, response = self.run_test(
                f"Fetch Image with Keywords: {keywords}",
                "GET",
                f"fetch-image?keywords={keywords.replace(' ', '%20')}",
                200,
                timeout=60
            )
            
            if not success:
                print(f"❌ Failed to fetch image for keywords: {keywords}")
                return False
            
            # Verify response structure
            if not response.get('success'):
                print(f"❌ Response missing success field for keywords: {keywords}")
                return False
            
            image_url = response.get('image_url')
            if not image_url or not image_url.startswith('data:image/jpeg;base64,'):
                print(f"❌ Invalid image URL format for keywords: {keywords}")
                return False
            
            print(f"✅ Successfully fetched image for keywords: {keywords}")
        
        print("✅ All different keywords returned valid base64 images")
        return True

    def test_fetch_image_empty_keywords(self):
        """Test fetching image with empty keywords (should use fallback)"""
        success, response = self.run_test(
            "Fetch Image with Empty Keywords",
            "GET",
            "fetch-image?keywords=",
            200,
            timeout=60
        )
        
        if success:
            # Verify response structure
            if not response.get('success'):
                print("❌ Response missing success field or success=false")
                return False
            
            image_url = response.get('image_url')
            if not image_url:
                print("❌ Response missing image_url field")
                return False
            
            # Verify base64 format
            if not image_url.startswith('data:image/jpeg;base64,'):
                print(f"❌ Invalid image URL format. Expected 'data:image/jpeg;base64,...', got: {image_url[:50]}...")
                return False
            
            # Verify base64 content exists
            base64_part = image_url.split('base64,')[1] if 'base64,' in image_url else ''
            if len(base64_part) < 100:
                print(f"❌ Base64 content too small: {len(base64_part)} characters")
                return False
            
            print(f"✅ Successfully fetched fallback image with empty keywords")
            print(f"   Image URL format: {image_url[:50]}...")
            print(f"   Base64 content size: {len(base64_part)} characters")
            return True
        
        return False

    def test_fetch_image_size_validation(self):
        """Test that returned base64 string is reasonable size"""
        success, response = self.run_test(
            "Fetch Image Size Validation",
            "GET",
            "fetch-image?keywords=nature test",
            200,
            timeout=60
        )
        
        if success:
            image_url = response.get('image_url', '')
            if not image_url.startswith('data:image/jpeg;base64,'):
                print("❌ Invalid image URL format")
                return False
            
            # Extract base64 content
            base64_part = image_url.split('base64,')[1] if 'base64,' in image_url else ''
            
            # Check size constraints
            min_size = 1000  # At least 1KB base64 (roughly 750 bytes image)
            max_size = 10000000  # At most 10MB base64 (roughly 7.5MB image)
            
            if len(base64_part) < min_size:
                print(f"❌ Image too small: {len(base64_part)} characters (minimum: {min_size})")
                return False
            
            if len(base64_part) > max_size:
                print(f"❌ Image too large: {len(base64_part)} characters (maximum: {max_size})")
                return False
            
            # Verify it's valid base64
            try:
                import base64
                decoded = base64.b64decode(base64_part)
                if len(decoded) < 500:  # At least 500 bytes for a real image
                    print(f"❌ Decoded image too small: {len(decoded)} bytes")
                    return False
            except Exception as e:
                print(f"❌ Invalid base64 content: {str(e)}")
                return False
            
            print(f"✅ Image size validation passed")
            print(f"   Base64 size: {len(base64_part)} characters")
            print(f"   Decoded size: {len(decoded)} bytes")
            return True
        
        return False

    # ============= NEW PEXELS MULTIPLE IMAGE FETCH TESTS =============

    def test_fetch_multiple_images_good_keywords(self):
        """Test fetching multiple images with good keywords (forest mushroom, count=3)"""
        success, response = self.run_test(
            "Fetch Multiple Images with Good Keywords",
            "GET",
            "fetch-images?keywords=forest mushroom&count=3",
            200,
            timeout=60  # Extended timeout for Pexels API
        )
        
        if success:
            # Verify response structure
            if not response.get('success'):
                print("❌ Response missing success field or success=false")
                return False
            
            image_urls = response.get('image_urls')
            if not image_urls:
                print("❌ Response missing image_urls field")
                return False
            
            if not isinstance(image_urls, list):
                print("❌ image_urls is not a list")
                return False
            
            # Verify we got 2-3 images as expected
            if len(image_urls) < 2 or len(image_urls) > 3:
                print(f"❌ Expected 2-3 images, got {len(image_urls)}")
                return False
            
            # Verify each image URL format
            for i, image_url in enumerate(image_urls):
                if not image_url.startswith('data:image/jpeg;base64,'):
                    print(f"❌ Invalid image URL format for image {i+1}. Expected 'data:image/jpeg;base64,...', got: {image_url[:50]}...")
                    return False
                
                # Verify base64 content exists and is reasonable size
                base64_part = image_url.split('base64,')[1] if 'base64,' in image_url else ''
                if len(base64_part) < 1000:  # At least 1KB base64
                    print(f"❌ Base64 content too small for image {i+1}: {len(base64_part)} characters")
                    return False
                
                if len(base64_part) > 5000000:  # Max 5MB base64
                    print(f"❌ Base64 content too large for image {i+1}: {len(base64_part)} characters")
                    return False
            
            print(f"✅ Successfully fetched {len(image_urls)} images with good keywords")
            print(f"   All images have correct base64 format")
            for i, url in enumerate(image_urls):
                base64_size = len(url.split('base64,')[1]) if 'base64,' in url else 0
                print(f"   Image {i+1} size: {base64_size} characters")
            return True
        
        return False

    def test_fetch_multiple_images_different_keywords(self):
        """Test fetching images with different keywords"""
        test_keywords = ["ocean nature", "mountain landscape", "health wellness"]
        
        for keywords in test_keywords:
            print(f"\n🔍 Testing multiple images with keywords: '{keywords}'")
            success, response = self.run_test(
                f"Fetch Multiple Images with Keywords: {keywords}",
                "GET",
                f"fetch-images?keywords={keywords.replace(' ', '%20')}&count=3",
                200,
                timeout=60
            )
            
            if not success:
                print(f"❌ Failed to fetch images for keywords: {keywords}")
                return False
            
            # Verify response structure
            if not response.get('success'):
                print(f"❌ Response missing success field for keywords: {keywords}")
                return False
            
            image_urls = response.get('image_urls', [])
            if len(image_urls) < 2:
                print(f"❌ Expected at least 2 images for keywords '{keywords}', got {len(image_urls)}")
                return False
            
            # Verify all images have correct format
            for i, image_url in enumerate(image_urls):
                if not image_url.startswith('data:image/jpeg;base64,'):
                    print(f"❌ Invalid image URL format for keywords '{keywords}', image {i+1}")
                    return False
            
            print(f"✅ Successfully fetched {len(image_urls)} images for keywords: {keywords}")
        
        print("✅ All different keywords returned valid multiple base64 images")
        return True

    def test_fetch_images_with_count_parameter(self):
        """Test fetching images with specific count parameter (count=2)"""
        success, response = self.run_test(
            "Fetch Images with Count Parameter (count=2)",
            "GET",
            "fetch-images?keywords=nature&count=2",
            200,
            timeout=60
        )
        
        if success:
            # Verify response structure
            if not response.get('success'):
                print("❌ Response missing success field or success=false")
                return False
            
            image_urls = response.get('image_urls', [])
            if len(image_urls) != 2:
                print(f"❌ Expected exactly 2 images, got {len(image_urls)}")
                return False
            
            # Verify both images have correct format
            for i, image_url in enumerate(image_urls):
                if not image_url.startswith('data:image/jpeg;base64,'):
                    print(f"❌ Invalid image URL format for image {i+1}")
                    return False
            
            print(f"✅ Successfully fetched exactly 2 images as requested")
            return True
        
        return False

    def test_fetch_images_quality_check(self):
        """Test image quality - verify reasonable size and different images"""
        success, response = self.run_test(
            "Fetch Images Quality Check",
            "GET",
            "fetch-images?keywords=mushroom forest&count=3",
            200,
            timeout=60
        )
        
        if success:
            image_urls = response.get('image_urls', [])
            if len(image_urls) < 2:
                print(f"❌ Need at least 2 images for quality check, got {len(image_urls)}")
                return False
            
            decoded_sizes = []
            base64_contents = []
            
            # Check each image quality
            for i, image_url in enumerate(image_urls):
                if not image_url.startswith('data:image/jpeg;base64,'):
                    print(f"❌ Invalid format for image {i+1}")
                    return False
                
                # Extract and validate base64 content
                base64_part = image_url.split('base64,')[1] if 'base64,' in image_url else ''
                base64_contents.append(base64_part)
                
                # Verify it's valid base64 and reasonable size
                try:
                    import base64
                    decoded = base64.b64decode(base64_part)
                    decoded_sizes.append(len(decoded))
                    
                    # Check size constraints (reasonable size for web images)
                    if len(decoded) < 5000:  # 5KB minimum
                        print(f"❌ Image {i+1} too small: {len(decoded)} bytes (minimum: 5KB)")
                        return False
                    
                    if len(decoded) > 500000:  # 500KB maximum  
                        print(f"❌ Image {i+1} too large: {len(decoded)} bytes (maximum: 500KB)")
                        return False
                        
                except Exception as e:
                    print(f"❌ Invalid base64 content for image {i+1}: {str(e)}")
                    return False
            
            # Verify images are different (not duplicates)
            if len(set(base64_contents)) != len(base64_contents):
                print("❌ Found duplicate images - images should be different")
                return False
            
            print(f"✅ Image quality check passed")
            print(f"   Number of images: {len(image_urls)}")
            print(f"   All images are different (no duplicates)")
            for i, size in enumerate(decoded_sizes):
                print(f"   Image {i+1} decoded size: {size} bytes ({size/1024:.1f}KB)")
            return True
        
        return False

    def test_fetch_images_error_handling(self):
        """Test error handling for fetch-images endpoint"""
        # Test with missing keywords parameter
        success, response = self.run_test(
            "Fetch Images without Keywords Parameter",
            "GET",
            "fetch-images",
            422,  # FastAPI validation error for missing required parameter
            timeout=30
        )
        
        if success:
            print("✅ Correctly returned 422 for missing keywords parameter")
            return True
        else:
            # If 422 didn't work, try with empty keywords to see what happens
            success2, response2 = self.run_test(
                "Fetch Images with Empty Keywords",
                "GET", 
                "fetch-images?keywords=",
                200,  # Might still work with empty keywords
                timeout=60
            )
            if success2:
                print("✅ Empty keywords handled gracefully")
                return True
        
        return False

    # ============= PAYPAL & ORDER MANAGEMENT TESTS =============
    
    def test_create_paypal_order(self):
        """Test creating a PayPal order"""
        order_data = {
            "items": [
                {
                    "product_id": "test-product-1",
                    "name": "Test Lion's Mane Extract",
                    "price": 29.99,
                    "quantity": 2,
                    "product_type": "physical"
                }
            ],
            "total": 59.98,
            "customer_email": "customer@example.com"
        }
        
        success, response = self.run_test(
            "Create PayPal Order",
            "POST",
            "shop/create-order",
            200,
            data=order_data,
            timeout=60
        )
        
        if success:
            # Verify response structure
            required_fields = ['success', 'approval_url', 'order_id', 'payment_id']
            for field in required_fields:
                if field not in response:
                    print(f"❌ Missing required field: {field}")
                    return False
            
            if not response.get('success'):
                print("❌ Order creation not successful")
                return False
            
            # Store for later tests
            self.test_order_id = response.get('order_id')
            self.test_payment_id = response.get('payment_id')
            
            print(f"✅ PayPal order created successfully")
            print(f"   Order ID: {self.test_order_id}")
            print(f"   Payment ID: {self.test_payment_id}")
            print(f"   Approval URL: {response.get('approval_url')[:50]}...")
            return True
        
        return False

    def test_create_order_with_coupon(self):
        """Test creating order with coupon code"""
        # First create a test coupon
        coupon_data = {
            "code": "TEST10",
            "discount_type": "percentage",
            "discount_value": 10.0,
            "is_active": True
        }
        
        coupon_success, coupon_response = self.run_test(
            "Create Test Coupon for Order",
            "POST",
            "coupons",
            200,
            data=coupon_data
        )
        
        if not coupon_success:
            print("❌ Failed to create test coupon")
            return False
        
        # Now create order with coupon
        order_data = {
            "items": [
                {
                    "product_id": "test-product-2",
                    "name": "Test Reishi Capsules",
                    "price": 24.99,
                    "quantity": 1,
                    "product_type": "physical"
                }
            ],
            "total": 24.99,
            "customer_email": "customer@example.com",
            "coupon_code": "TEST10"
        }
        
        success, response = self.run_test(
            "Create Order with Coupon",
            "POST",
            "shop/create-order",
            200,
            data=order_data,
            timeout=60
        )
        
        if success and response.get('success'):
            print(f"✅ Order with coupon created successfully")
            return True
        
        return False

    def test_get_all_orders(self):
        """Test getting all orders (admin)"""
        success, response = self.run_test(
            "Get All Orders (Admin)",
            "GET",
            "orders",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"✅ Successfully retrieved {len(response)} orders")
                return True
            else:
                print("❌ Response is not a list")
                return False
        
        return False

    def test_get_single_order_tracking(self):
        """Test public order tracking"""
        if not hasattr(self, 'test_order_id'):
            print("❌ Cannot test order tracking - no order ID available")
            return False
        
        success, response = self.run_test(
            "Get Single Order",
            "GET",
            f"orders/{self.test_order_id}",
            200
        )
        
        if success and response.get('id') == self.test_order_id:
            print(f"✅ Successfully retrieved order: {self.test_order_id}")
            return True
        
        return False

    def test_update_order_status(self):
        """Test updating order status"""
        if not hasattr(self, 'test_order_id'):
            print("❌ Cannot test order status update - no order ID available")
            return False
        
        # The endpoint expects status as a query parameter, not in body
        success, response = self.run_test(
            "Update Order Status to Paid",
            "PUT",
            f"orders/{self.test_order_id}/status?status=paid",
            200
        )
        
        if success and response.get('success'):
            print("✅ Order status updated successfully")
            return True
        
        return False

    def test_update_order_tracking(self):
        """Test updating order tracking information"""
        if not hasattr(self, 'test_order_id'):
            print("❌ Cannot test order tracking update - no order ID available")
            return False
        
        # The endpoint expects tracking_number and shipping_carrier as query parameters
        success, response = self.run_test(
            "Update Order Tracking Info",
            "PUT",
            f"orders/{self.test_order_id}/tracking?tracking_number=DHL123456789&shipping_carrier=DHL",
            200
        )
        
        if success and response.get('success'):
            print(f"✅ Order tracking updated successfully")
            print(f"   Tracking URL: {response.get('tracking_url', 'N/A')}")
            return True
        
        return False

    def test_mark_order_viewed(self):
        """Test marking order as viewed by admin"""
        if not hasattr(self, 'test_order_id'):
            print("❌ Cannot test mark order viewed - no order ID available")
            return False
        
        success, response = self.run_test(
            "Mark Order as Viewed",
            "POST",
            f"orders/{self.test_order_id}/mark-viewed",
            200
        )
        
        if success and response.get('success'):
            print("✅ Order marked as viewed successfully")
            return True
        
        return False

    def test_get_unviewed_orders_count(self):
        """Test getting unviewed orders count"""
        success, response = self.run_test(
            "Get Unviewed Orders Count",
            "GET",
            "orders/unviewed/count",
            200
        )
        
        if success and 'count' in response:
            print(f"✅ Unviewed orders count: {response['count']}")
            return True
        
        return False

    def test_delete_order(self):
        """Test deleting an order"""
        if not hasattr(self, 'test_order_id'):
            print("❌ Cannot test order deletion - no order ID available")
            return False
        
        success, response = self.run_test(
            "Delete Order",
            "DELETE",
            f"orders/{self.test_order_id}",
            200
        )
        
        if success and response.get('success'):
            print("✅ Order deleted successfully")
            return True
        
        return False

    # ============= COUPON MANAGEMENT TESTS =============
    
    def test_create_coupon(self):
        """Test creating a coupon"""
        coupon_data = {
            "code": "SAVE20",
            "discount_type": "percentage",
            "discount_value": 20.0,
            "is_active": True
        }
        
        success, response = self.run_test(
            "Create Coupon",
            "POST",
            "coupons",
            200,
            data=coupon_data
        )
        
        if success and response.get('id'):
            self.test_coupon_id = response['id']
            print(f"✅ Coupon created successfully: {response['code']}")
            return True
        
        return False

    def test_get_all_coupons(self):
        """Test getting all coupons (admin)"""
        success, response = self.run_test(
            "Get All Coupons",
            "GET",
            "coupons",
            200
        )
        
        if success:
            if isinstance(response, list):
                print(f"✅ Successfully retrieved {len(response)} coupons")
                return True
            else:
                print("❌ Response is not a list")
                return False
        
        return False

    def test_get_active_coupons_public(self):
        """Test getting active coupons (public endpoint)"""
        success, response = self.run_test(
            "Get Active Coupons (Public)",
            "GET",
            "shop/coupons/active",
            200
        )
        
        if success:
            print("✅ Active coupons retrieved successfully")
            return True
        
        return False

    def test_validate_coupon(self):
        """Test coupon validation"""
        # The endpoint expects code and subtotal as query parameters
        success, response = self.run_test(
            "Validate Coupon",
            "POST",
            "coupons/validate?code=SAVE20&subtotal=100.0",
            200
        )
        
        if success and response.get('valid'):
            print(f"✅ Coupon validation successful")
            print(f"   Discount amount: ${response.get('discount_amount', 0)}")
            return True
        
        return False

    def test_update_coupon(self):
        """Test updating a coupon"""
        if not hasattr(self, 'test_coupon_id'):
            print("❌ Cannot test coupon update - no coupon ID available")
            return False
        
        update_data = {
            "discount_value": 25.0,
            "is_active": True
        }
        
        success, response = self.run_test(
            "Update Coupon",
            "PUT",
            f"coupons/{self.test_coupon_id}",
            200,
            data=update_data
        )
        
        if success:
            print("✅ Coupon updated successfully")
            return True
        
        return False

    def test_delete_coupon(self):
        """Test deleting a coupon"""
        if not hasattr(self, 'test_coupon_id'):
            print("❌ Cannot test coupon deletion - no coupon ID available")
            return False
        
        success, response = self.run_test(
            "Delete Coupon",
            "DELETE",
            f"coupons/{self.test_coupon_id}",
            200
        )
        
        if success and response.get('success'):
            print("✅ Coupon deleted successfully")
            return True
        
        return False

    # ============= ADMIN SETTINGS TESTS =============
    
    def test_get_admin_settings(self):
        """Test getting admin settings"""
        success, response = self.run_test(
            "Get Admin Settings",
            "GET",
            "admin/settings",
            200
        )
        
        if success and 'admin_username' in response:
            print(f"✅ Admin settings retrieved: username = {response['admin_username']}")
            return True
        
        return False

    def test_update_admin_settings(self):
        """Test updating admin settings"""
        settings_data = {
            "current_password": "apebrain2024",
            "admin_username": "admin"
        }
        
        success, response = self.run_test(
            "Update Admin Settings",
            "POST",
            "admin/settings",
            200,
            data=settings_data
        )
        
        if success and response.get('success'):
            print("✅ Admin settings updated successfully")
            return True
        
        return False

    # ============= BLOG CRUD COMPREHENSIVE TESTS =============
    
    def test_update_blog(self):
        """Test updating a blog post"""
        if not self.test_blog_id:
            print("❌ Cannot test blog update - no blog ID available")
            return False
        
        update_data = {
            "title": "Updated Test Blog Title",
            "content": "This is updated content for the test blog post.",
            "keywords": "updated test keywords"
        }
        
        success, response = self.run_test(
            "Update Blog Post",
            "PUT",
            f"blogs/{self.test_blog_id}",
            200,
            data=update_data
        )
        
        if success and response.get('id') == self.test_blog_id:
            print("✅ Blog updated successfully")
            return True
        
        return False

    def test_get_blogs_with_status_filter(self):
        """Test getting blogs with status filter"""
        success, response = self.run_test(
            "Get Blogs with Status Filter (draft)",
            "GET",
            "blogs?status=draft",
            200
        )
        
        if success:
            print(f"✅ Found {len(response)} draft blogs")
            return True
        
        return False

def main():
    print("🍄 Starting Mushroom Blog API Tests")
    print("=" * 50)
    
    tester = MushroomBlogAPITester()
    
    # Test sequence - Comprehensive Backend Testing (Priority Order)
    tests = [
        # CRITICAL PRIORITY - Authentication & Security
        ("Admin Login (Valid)", tester.test_admin_login_valid),
        ("Admin Login (Invalid)", tester.test_admin_login_invalid),
        
        # CRITICAL PRIORITY - PayPal Integration
        ("Create PayPal Order", tester.test_create_paypal_order),
        ("Create Order with Coupon", tester.test_create_order_with_coupon),
        
        # HIGH PRIORITY - Order Management System
        ("Get All Orders (Admin)", tester.test_get_all_orders),
        ("Public Order Tracking", tester.test_get_single_order_tracking),
        ("Mark Order as Viewed", tester.test_mark_order_viewed),
        ("Get Unviewed Orders Count", tester.test_get_unviewed_orders_count),
        ("Update Order Status", tester.test_update_order_status),
        ("Update Order Tracking Info", tester.test_update_order_tracking),
        ("Delete Order", tester.test_delete_order),
        
        # HIGH PRIORITY - Blog System with AI Generation
        ("AI Blog Generation", tester.test_generate_blog),
        ("Create Blog Post", tester.test_create_blog),
        ("Get All Blogs", tester.test_get_blogs),
        ("Get Blogs with Status Filter", tester.test_get_blogs_with_status_filter),
        ("Get Single Blog", tester.test_get_single_blog),
        ("Update Blog Post", tester.test_update_blog),
        ("Publish Blog", tester.test_publish_blog),
        ("Delete Blog", tester.test_delete_blog),
        
        # HIGH PRIORITY - Coupon System
        ("Create Coupon", tester.test_create_coupon),
        ("Get All Coupons", tester.test_get_all_coupons),
        ("Get Active Coupons (Public)", tester.test_get_active_coupons_public),
        ("Validate Coupon", tester.test_validate_coupon),
        ("Update Coupon", tester.test_update_coupon),
        ("Delete Coupon", tester.test_delete_coupon),
        
        # MEDIUM PRIORITY - Settings Endpoints (Already tested but re-verify)
        ("Get Admin Settings", tester.test_get_admin_settings),
        ("Update Admin Settings", tester.test_update_admin_settings),
        ("Get Default Landing Settings", tester.test_get_default_landing_settings),
        ("Save Landing Settings", tester.test_save_landing_settings),
        ("Get Saved Landing Settings", tester.test_get_saved_landing_settings),
        ("Update Landing Settings", tester.test_update_landing_settings),
        ("Verify Updated Landing Settings", tester.test_verify_updated_landing_settings),
        ("Get Default Blog Features", tester.test_get_default_blog_features),
        ("Save Blog Features", tester.test_save_blog_features),
        ("Get Saved Blog Features", tester.test_get_saved_blog_features),
        
        # FEATURES ALREADY TESTED (Quick re-verification)
        ("Get All Products", tester.test_get_products),
        ("Create Product", tester.test_create_product),
        ("Upload Product Image", tester.test_upload_product_image),
        ("Get Products with Images", tester.test_get_products_with_images),
        ("Update Product", tester.test_update_product),
        ("Upload Image to Non-existent Product", tester.test_upload_image_to_nonexistent_product),
        ("Delete Product", tester.test_delete_product),
        
        # Blog Multimedia Features
        ("Create Blog with Video URL", tester.test_create_blog_with_video_url),
        ("Get Blog with Video URL", tester.test_get_blog_with_video_url),
        ("Upload Blog Audio", tester.test_upload_blog_audio),
        ("Get Blog with Audio URL", tester.test_get_blog_with_audio_url),
        ("Upload Audio to Non-existent Blog", tester.test_upload_audio_to_nonexistent_blog),
        ("Delete Test Video Blog", tester.test_cleanup_test_video_blog),
        
        # Image Fetch Features
        ("Fetch Multiple Images with Good Keywords", tester.test_fetch_multiple_images_good_keywords),
        ("Fetch Multiple Images with Different Keywords", tester.test_fetch_multiple_images_different_keywords),
        ("Fetch Images with Count Parameter", tester.test_fetch_images_with_count_parameter),
        ("Fetch Images Quality Check", tester.test_fetch_images_quality_check),
        ("Fetch Images Error Handling", tester.test_fetch_images_error_handling),
        ("Fetch Image with Good Keywords", tester.test_fetch_image_good_keywords),
        ("Fetch Image with Different Keywords", tester.test_fetch_image_different_keywords),
        ("Fetch Image with Empty Keywords", tester.test_fetch_image_empty_keywords),
        ("Fetch Image Size Validation", tester.test_fetch_image_size_validation),
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