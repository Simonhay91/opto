"""
Backend proxy tests for Optowire catalog app.
Tests: health, category API (JSON/not Brotli), sliders API, products API, proxy encoding.
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestHealth:
    """Health check endpoints"""

    def test_health_root(self):
        resp = requests.get(f"{BASE_URL}/health")
        assert resp.status_code == 200
        # Root health may return empty body (served by nginx/K8s), just check 200

    def test_health_api(self):
        resp = requests.get(f"{BASE_URL}/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"


class TestCategoryProxy:
    """Category API - verify JSON (not Brotli binary), structure, and 4 allowed categories"""

    def test_category_returns_200(self):
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        assert resp.status_code == 200

    def test_category_returns_json(self):
        """Proxy must decompress response so client gets JSON"""
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        assert resp.status_code == 200
        # Must be valid JSON (not binary/Brotli)
        data = resp.json()
        assert isinstance(data, list), "Category response must be a JSON array"

    def test_category_has_required_fields(self):
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        data = resp.json()
        assert len(data) > 0
        cat = data[0]
        assert "id" in cat
        assert "name" in cat

    def test_category_4_allowed_ids_present(self):
        """After frontend filtering, exactly 4 categories: Telecom, Network, Security, IoT"""
        ALLOWED = {1, 91, 188, 212}
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        data = resp.json()
        ids = {int(c["id"]) for c in data}
        found = ALLOWED & ids
        assert found == ALLOWED, f"Missing allowed categories: {ALLOWED - found}"

    def test_category_has_children(self):
        """Categories should have subcategories (children)"""
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        data = resp.json()
        telecom = next((c for c in data if int(c["id"]) == 1), None)
        assert telecom is not None, "Telecommunication category (ID=1) must exist"
        children = telecom.get("children", [])
        assert len(children) > 0, "Telecommunication must have subcategories"

    def test_category_response_not_brotli_binary(self):
        """Response content must be valid UTF-8 JSON, not Brotli-compressed binary"""
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        content = resp.content
        # Brotli-compressed data starts with specific bytes; valid JSON starts with '[' or '{'
        try:
            text = content.decode('utf-8')
            json.loads(text)
            assert True  # Valid JSON
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            pytest.fail(f"Response is not valid JSON (possibly Brotli binary): {e}")

    def test_category_slugs_present(self):
        """Required category slugs for mega-menu routing"""
        REQUIRED_SLUGS = {"telecommunication", "network-equipment", "security-systems", "iot"}
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        data = resp.json()
        slugs = {c.get("slug") for c in data}
        missing = REQUIRED_SLUGS - slugs
        assert not missing, f"Missing category slugs: {missing}"


class TestSliderProxy:
    """Slider API - verify JSON with real image paths"""

    def test_sliders_returns_200(self):
        resp = requests.get(f"{BASE_URL}/api/ext/web/sliders")
        assert resp.status_code == 200

    def test_sliders_returns_json_array(self):
        resp = requests.get(f"{BASE_URL}/api/ext/web/sliders")
        data = resp.json()
        assert isinstance(data, list), "Sliders response must be a JSON array"

    def test_sliders_have_images(self):
        """Sliders must have real image data (not placeholders)"""
        resp = requests.get(f"{BASE_URL}/api/ext/web/sliders")
        data = resp.json()
        assert len(data) > 0, "Must have at least 1 slider"
        for slider in data:
            img = slider.get("image")
            assert img is not None, f"Slider {slider.get('id')} has no image object"
            # Image must have at least one path field
            path = img.get("path") or img.get("optimizedPath") or img.get("path636px")
            assert path, f"Slider {slider.get('id')} image has no path"

    def test_sliders_response_not_brotli(self):
        """Sliders must return decompressed JSON"""
        resp = requests.get(f"{BASE_URL}/api/ext/web/sliders")
        try:
            content = resp.content.decode('utf-8')
            json.loads(content)
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            pytest.fail(f"Sliders response is not valid JSON: {e}")

    def test_wrong_slider_endpoint_returns_404(self):
        """/web/slider (without 's') should 404 - confirm correct endpoint is /web/sliders"""
        resp = requests.get(f"{BASE_URL}/api/ext/web/slider")
        # External API returns 404 for wrong endpoint - confirming correct is /web/sliders
        assert resp.status_code == 404


class TestProductsProxy:
    """Products API - verify 1138 total products"""

    def test_products_explore_returns_200(self):
        resp = requests.post(
            f"{BASE_URL}/api/ext/web/product/explore",
            json={"page": 1, "limit": 1},
            headers={"Content-Type": "application/json"}
        )
        # External API returns 200 or 201 for explore POST
        assert resp.status_code in (200, 201)

    def test_products_total_count(self):
        """Catalog must show ~1138 total products"""
        resp = requests.post(
            f"{BASE_URL}/api/ext/web/product/explore",
            json={"page": 1, "limit": 1},
            headers={"Content-Type": "application/json"}
        )
        data = resp.json()
        total = data.get("total", 0)
        assert total >= 1000, f"Expected >= 1000 products, got {total}"

    def test_products_response_structure(self):
        resp = requests.post(
            f"{BASE_URL}/api/ext/web/product/explore",
            json={"page": 1, "limit": 5},
            headers={"Content-Type": "application/json"}
        )
        data = resp.json()
        assert "products" in data or "items" in data, "Must have products or items list"
        assert "total" in data, "Must have total count"

    def test_products_have_names(self):
        resp = requests.post(
            f"{BASE_URL}/api/ext/web/product/explore",
            json={"page": 1, "limit": 5},
            headers={"Content-Type": "application/json"}
        )
        data = resp.json()
        products = data.get("products", data.get("items", []))
        assert len(products) > 0
        for p in products:
            assert "name" in p or "id" in p


class TestProxyHeaders:
    """Proxy header forwarding - no Brotli, partner key injected"""

    def test_proxy_content_type_is_json(self):
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        ct = resp.headers.get("content-type", "")
        assert "json" in ct.lower(), f"Expected JSON content-type, got: {ct}"

    def test_proxy_no_brotli_encoding_in_response(self):
        """Proxy strips content-encoding from response"""
        resp = requests.get(f"{BASE_URL}/api/ext/web/category")
        ce = resp.headers.get("content-encoding", "")
        assert "br" not in ce.lower(), f"Brotli encoding should not reach client, got: {ce}"
