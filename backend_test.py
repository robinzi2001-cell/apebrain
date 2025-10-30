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

def main():
    print("🍄 Starting Mushroom Blog API Tests")
    print("=" * 50)
    
    tester = MushroomBlogAPITester()
    
    # Test sequence
    tests = [
        ("Admin Login (Valid)", tester.test_admin_login_valid),
        ("Admin Login (Invalid)", tester.test_admin_login_invalid),
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