import json
import requests

async def handlePostData():
    setLoading(True)
    try:
        url = "https://api.allorigins.win/raw?url=http://203.170.129.88:9078/api/QRCode"
        headers = {
            "Content-Type": "application/json"
        }
        data = {
            "part_model": "HL-04005PW-B",
            "station": 10,
            "part_id": 324,
            "emp_name": "jow",
            "status": "D"
        }
        
        response = await requests.post(url, headers=headers, data=json.dumps(data))
        print("POST Data Response:", response.json())
        
        if not response.ok:
            raise Exception(f"HTTP error! Status: {response.status_code}")
        
        jsonData = await response.json()
        print("PATCH Data Response:", jsonData)
        # Optionally update state or perform additional actions upon successful PATCH
    except Exception as error:
        setError(str(error))
    finally:
        setLoading(False)

handlePostData()