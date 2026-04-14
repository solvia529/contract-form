import requests, sys, os, time

TOKEN    = "z2ogkVylUzY2h1v912IwwsvuUEBDY076C8UFva9EKVp6s6GKjTMQBQWvxcQpL3nKHxGFlJrpJHBYa4vXlcsjq/Y38x3Lx0/YAfVVNSFHik4pEqMiw/UiH8E4eBv/T00CjXggzgn1Ko2cTiBLPhZnEgdB04t89/1O/w1cDnyilFU="
ALIAS_P1 = "menu-page1"
ALIAS_P2 = "menu-page2"
BASE     = "https://api.line.me/v2/bot"
HEADERS  = {"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"}
DIR      = "/Users/kanrisha/contract-form"
IMG_P1   = f"{DIR}/menu_page1_final.jpg"
IMG_P2   = f"{DIR}/menu_page2_final.jpg"

def create_menu(data):
    res = requests.post(f"{BASE}/richmenu", headers=HEADERS, json=data)
    if not res.ok: print(f"❌ {res.status_code} {res.text}"); sys.exit(1)
    return res.json()["richMenuId"]

def upload_image(menu_id, path):
    with open(path, "rb") as f: data = f.read()
    url = f"https://api-data.line.me/v2/bot/richmenu/{menu_id}/content"
    res = requests.post(url,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "image/jpeg"}, data=data)
    if not res.ok: print(f"❌ {res.status_code} {res.text}"); sys.exit(1)

def upsert_alias(alias_id, menu_id):
    requests.delete(f"{BASE}/richmenu/alias/{alias_id}", headers={"Authorization": f"Bearer {TOKEN}"})
    res = requests.post(f"{BASE}/richmenu/alias", headers=HEADERS,
        json={"richMenuAliasId": alias_id, "richMenuId": menu_id})
    if not res.ok: print(f"❌ {res.status_code} {res.text}"); sys.exit(1)

def set_default(menu_id):
    res = requests.post(f"{BASE}/user/all/richmenu/{menu_id}", headers={"Authorization": f"Bearer {TOKEN}"})
    if not res.ok: print(f"❌ {res.status_code} {res.text}"); sys.exit(1)

menu1 = {
    "size": {"width": 2500, "height": 1686}, "selected": True,
    "name": "予約メニュー（ページ1）", "chatBarText": "メニュー ▲",
    "areas": [
        {"bounds": {"x": 0,    "y": 0,   "width": 833, "height": 843}, "action": {"type": "message", "label": "予約方法", "text": "予約方法"}},
        {"bounds": {"x": 833,  "y": 0,   "width": 834, "height": 843}, "action": {"type": "message", "label": "キャンセル方法", "text": "キャンセル方法"}},
        {"bounds": {"x": 1667, "y": 0,   "width": 833, "height": 843}, "action": {"type": "richmenuswitch", "richMenuAliasId": ALIAS_P2, "data": "switch_to_page2"}},
        {"bounds": {"x": 0,    "y": 843, "width": 833, "height": 843}, "action": {"type": "uri", "label": "取り外し装置調整予約", "uri": "https://airrsv.net/ka2-kyousei/calendar?schdlId=s0000B9E8C"}},
        {"bounds": {"x": 833,  "y": 843, "width": 834, "height": 843}, "action": {"type": "uri", "label": "2期ワイヤー午後・土曜日", "uri": "https://airrsv.net/ka2-kyousei/calendar?schdlId=s0000B9EA1"}},
        {"bounds": {"x": 1667, "y": 843, "width": 833, "height": 843}, "action": {"type": "uri", "label": "2期ワイヤー平日午前", "uri": "https://airrsv.net/ka2-kyousei/calendar?schdlId=s0000B9E8D"}},
    ]
}

menu2 = {
    "size": {"width": 2500, "height": 843}, "selected": True,
    "name": "緊急・契約メニュー（ページ2）", "chatBarText": "メニュー ▲",
    "areas": [
        {"bounds": {"x": 0,    "y": 0, "width": 833, "height": 843}, "action": {"type": "richmenuswitch", "richMenuAliasId": ALIAS_P1, "data": "switch_to_page1"}},
        {"bounds": {"x": 833,  "y": 0, "width": 834, "height": 843}, "action": {"type": "message", "label": "急患・当日キャンセル・遅刻", "text": "急患等"}},
        {"bounds": {"x": 1667, "y": 0, "width": 833, "height": 843}, "action": {"type": "uri", "label": "契約前フォーム", "uri": "https://contract-form-kappa.vercel.app?v=2"}},
    ]
}

print("🟢 ページ1 作成中...")
id1 = create_menu(menu1); print(f"   ID: {id1}")
print("🟢 ページ2 作成中...")
id2 = create_menu(menu2); print(f"   ID: {id2}")
print("🖼️  画像アップロード中...")
upload_image(id1, IMG_P1); upload_image(id2, IMG_P2)
print("⏳ 3秒待機中...")
time.sleep(3)
print("🔗 エイリアス作成中...")
upsert_alias(ALIAS_P1, id1); upsert_alias(ALIAS_P2, id2)
print("🏠 デフォルト設定中...")
set_default(id1)
print("✅ 完了！")
