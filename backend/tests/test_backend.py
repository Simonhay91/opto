"""Backend API tests for Optowire product catalog FastAPI proxy"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


# Health check
def test_health():
    resp = requests.get(f"{BASE_URL}/api/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "ok"
    assert "partner_key_set" in data
    print(f"Health OK, partner_key_set={data['partner_key_set']}")


# Proxy endpoints - should return JSON (may be error from upstream, but no 500)
def test_categories_proxy():
    resp = requests.get(f"{BASE_URL}/api/proxy/web/category")
    assert resp.status_code == 200
    data = resp.json()
    # Should return list or object with items
    print(f"Categories response type: {type(data)}, sample: {str(data)[:100]}")


def test_sliders_proxy():
    resp = requests.get(f"{BASE_URL}/api/proxy/web/sliders")
    assert resp.status_code == 200
    print(f"Sliders response: {str(resp.json())[:100]}")


def test_sections_proxy():
    resp = requests.get(f"{BASE_URL}/api/proxy/web/section")
    assert resp.status_code == 200
    print(f"Sections response: {str(resp.json())[:100]}")


def test_brands_proxy():
    resp = requests.get(f"{BASE_URL}/api/proxy/web/brand")
    assert resp.status_code == 200
    print(f"Brands response: {str(resp.json())[:100]}")


def test_partner_proxy():
    resp = requests.get(f"{BASE_URL}/api/proxy/web/partner/self")
    assert resp.status_code == 200
    print(f"Partner response: {str(resp.json())[:100]}")


def test_explore_products_proxy():
    resp = requests.post(
        f"{BASE_URL}/api/proxy/web/product/explore",
        json={"page": 1, "limit": 12, "sortBy": ""}
    )
    assert resp.status_code == 200
    print(f"Explore response: {str(resp.json())[:100]}")
