# with open("f.txt", "a", encoding="utf-8") as f:
#     for i in range(1500):
#         f.write(f"test-{i}\n")

import requests
import time


def test_rate_limit(url, data, headers=None, cookies=None, num_requests=50):
    """
    Generic rate-limit tester (use only on systems you own or have permission to test)

    Args:
        url (str): Endpoint URL
        data (dict): POST data
        headers (dict): Optional headers
        cookies (dict): Optional cookies (DO NOT hardcode real session tokens)
        num_requests (int): Number of requests to send
        delay (float): Delay between requests (seconds)
    """

    results = {}

    for i in range(num_requests):
        try:
            response = requests.post(
                url, data=data, headers=headers, cookies=cookies, timeout=10
            )

            status = response.status_code
            results[status] = results.get(status, 0) + 1

            print(f"Request {i + 1}: {status}")

        except Exception as e:
            print(f"Request {i + 1} failed: {e}")

    print("\nSummary:")
    for status, count in results.items():
        print(f"{status}: {count} responses")

    return results


url = "https://titanrptuat.titan.in/UserLogin/GetEncPassword"

data = r"plainpass=passData%3D%26Username%3Duq%2BtI1a87NV2IgkcLoM7AQ%3D%3D%26Password%3DE0%2FMrMK7NZL4ahkWNU9Kmg%3D%3D%26domain%3D85ac8c21-9ffd-492b-a189-a03b55eecfe1%26DomainName%3DANBAUTH%26returnurl%3D%26__RequestVerificationToken%3DCfDJ8MosugdBx8NAsTr8ijk1Mx6bmHP_ZOyIGLa6lf5QYD3IUbRLLVmZUG8YHEe9r4frXMdfdPDiYg44PB9Mb-P4Q6cWmjZcllHfheO-e_JlxnPp75VS9slp-sNj03Veywl-sxfMnog3HLxVba4h1dAi6rc"

headers = {
    "accept": "*/*",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": '"Chromium";v="146", "Not-A.Brand";v="24", "Google Chrome";v="146"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"macOS"',
    "x-requested-with": "XMLHttpRequest",
    "Referer": "https://titanrptuat.titan.in/",
}

# Only use test cookies for systems you control
cookies = None

test_rate_limit(url, data, headers, cookies, num_requests=200)
