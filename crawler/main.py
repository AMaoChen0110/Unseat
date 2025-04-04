import json
import requests
import urllib.parse
from bs4 import BeautifulSoup
from rich import print

BASE_URL = "https://www.twacda.com/"

def crawl():
    # get urls
    response = requests.get(BASE_URL)
    response.encoding = 'utf-8'
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all 'a' elements with the specific classes
    legislator_links = soup.find_all('a', class_=lambda c: c and 'framer-uu7vye' in c and 'framer-ntyrq4' in c)
    
    data = []
    # 用於追蹤已處理的名稱
    processed_names = set()
    for link in legislator_links:
        # Extract the href (relative URL)
        relative_url = link.get('href', '')
        if relative_url:
            # Extract legislator name from URL and decode URL encoding
            encoded_name = relative_url.split('/')[-1] if '/' in relative_url else relative_url
            
            # Decode URL encoding using UTF-8 (zh-TW)
            name = urllib.parse.unquote(encoded_name, encoding='utf-8')
            
            # Extract progress percentage
            progress_element = link.select_one('.framer-es2ia6 .framer-text')
            progress = progress_element.text.strip() if progress_element else "N/A"
            
            # Extract status
            status_element = link.select_one('.framer-41lv98 .framer-text')
            status = status_element.text.strip() if status_element else "N/A"
            
            # Extract image URL if available
            img_element = link.select_one('img')
            image_url = img_element.get('src', '') if img_element else ""
            
            # Create full URL
            full_url = BASE_URL.rstrip('/') + relative_url if relative_url.startswith('./') else BASE_URL.rstrip('/') + '/' + relative_url.lstrip('./')
            
            # Check if name has already been processed, skip if so
            if name in processed_names:
                print(f"跳過重複的立法委員: {name}")
                continue
                
            # Add name to processed set
            processed_names.add(name)
            
            data.append({
                'name': name,
                'relative_url': relative_url,
                'full_url': full_url,
                'progress': progress,
                'status': status,
                'image_url': image_url
            })
    
    print(f"Found {len(data)} legislators")

    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2, sort_keys=True)
    
    print(f"Data saved to data.json")

    # fetch urls and get detail data
    fetch_legislator_details(data)
    

def fetch_legislator_details(legislators_data):
    """Fetch detailed information for each legislator"""
    print(f"\nFetching detailed information for {len(legislators_data)} legislators...")
    
    for i, legislator in enumerate(legislators_data):
        try:
            print(f"Processing {i+1}/{len(legislators_data)}: {legislator['name']}")
            
            # Get the detailed page
            response = requests.get(legislator['full_url'])
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract region information
            region_elem = soup.select_one('p[style*="framer-text-color:var(--token-e4661cac-3f63-4ac0-b2ee-247c53de5c7b"]')
            if region_elem:
                region_text = region_elem.text.strip()
                # Extract region from text like "新北｜汐金萬、平雙溪、瑞芳、貢寮"
                if '｜' in region_text:
                    region_parts = region_text.split('｜')
                    city = region_parts[0].strip()
                    districts = region_parts[1].strip() if len(region_parts) > 1 else ""
                    legislator['region'] = {
                        'city': city,
                        'districts': districts
                    }
                else:
                    legislator['region'] = {
                        'city': region_text,
                        'districts': ""
                    }
            
            # Extract the statistics information
            stats = {}
            
            # Find all the statistics containers
            stat_containers = soup.find_all('div', class_=lambda c: c and 'framer-2fqc2p' in c)
            
            for container in stat_containers:
                # Get the title of the statistic
                title_elem = container.select_one('.framer-1lsokej .framer-text')
                if not title_elem:
                    continue
                    
                title = title_elem.text.strip()
                
                # Get the value of the statistic
                value_elem = container.select_one('.framer-70bafg .framer-text')
                if not value_elem:
                    continue
                    
                value = value_elem.text.strip()
                
                # Get the unit of the statistic
                unit_elem = container.select_one('.framer-1q06oa2 .framer-text')
                unit = unit_elem.text.strip() if unit_elem else ""
                
                # Store the statistic
                json_title = ""
                # 將中文翻譯成英文
                match title:
                    case "已收到收件份數":
                        json_title = "received_copies"
                        value = int(value)
                    case "收件進度":
                        json_title = "progress"
                        value = float(value)
                    case "達標門檻數":
                        json_title = "threshold"
                        value = int(value)
                    case _:
                        json_title = title
                stats[json_title] = {'value': value, 'unit': unit}
            
            # Add the statistics to the legislator data
            legislator['statistics'] = stats
            
        except Exception as e:
            print(f"Error processing {legislator['name']}: {str(e)}")
    
    # Update the JSON file with the detailed information
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(legislators_data, f, ensure_ascii=False, indent=2, sort_keys=True)
    
    print(f"\nDetailed information saved to data.json")

def integrate_data():
    """
    把資料整合到 personData.json，為每一個立法委員新增一個 key: twacda，然後放入資料
    """
    with open('data.json', 'r', encoding='utf-8') as f:
        legislator_data = json.load(f)
    
    with open('personData.json', 'r', encoding='utf-8') as f:
        person_data = json.load(f)
    
    # 建立一個字典，將 personData.json 中的立委資料以名字為鍵進行索引
    # 由於 personData.json 中的名字格式是「縣市+姓名」，需要進行處理
    person_dict = {}
    for person in person_data:
        # 從「縣市+姓名」中提取姓名部分
        name = person['name']
        if '市' in name:
            name = name.split('市')[-1]
        elif '縣' in name:
            name = name.split('縣')[-1]
        person_dict[name] = person
    
    # 計數器，用於追蹤成功配對的立委數量
    matched_count = 0
    
    # 遍歷從 TWACDA 爬取的立委資料
    for legislator in legislator_data:
        name = legislator['name']
        # 嘗試在 personData.json 中找到對應的立委
        if name in person_dict:
            # 找到匹配項，添加 twacda 資料
            person = person_dict[name]
            
            # 添加 twacda 資料，包括統計資料和區域資訊
            person['twacda'] = {
                'statistics': legislator['statistics'],
                'progress': legislator['progress'],
                'status': legislator['status'],
                'image_url': legislator['image_url']
            }
            
            # 如果有區域資訊，也添加進去
            if 'region' in legislator:
                person['twacda']['region'] = legislator['region']
            
            matched_count += 1
        else:
            print(f"未找到匹配的立委: {name}")
    
    # 將更新後的資料寫回 personData.json
    with open('personData.json', 'w', encoding='utf-8') as f:
        json.dump(person_data, f, ensure_ascii=False, indent=2, sort_keys=True)
    
    print(f"成功匹配並更新了 {matched_count}/{len(legislator_data)} 位立委的資料")
    print(f"整合後的資料已保存到 personData.json")

if __name__ == "__main__":
    crawl()
    integrate_data()