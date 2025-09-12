# 藍新金流服務平台

## 信用卡定期定額

## 技術串接手冊

#### 標準版

文件版本號： NDNP-1.0. 4

(文件為藍新科技股份有限公司版權所有)


**版本異動表**

文件版本號 修改內容 日期

NDNP-1.0.0 (^) 初版 2 022/ 10 / 18
NDNP-1.0. 1

**3. 交易流程**
- 修改三種定期定額驗證方式流程圖
**4.1 AES256加密方式**
- 修改參數 Version參數
**4.3.1 請求參數**
- 修改參數NotifyURL中文參數名稱
- 修改程式範例 PeriodStartType 說明文字
**4.5.1 請求參數**
- 新增參數 NotifyURL每期授權
結果通知網址
**4.5.2 回應參數**
- 修改參數 Extday 說明文字
- 新增參數 NotifyURL每期授權
結果通知網址
**6. 常見問題**
- 新增建立委託[NPA-B05]之常見問題

2 023/8/

NDNP-1.0. 2

**6. 常見問題**

- 新增建立委託[NPA-B05]之常見問題

2 023/11/ 17

NDNP-1.0. 3

**4. APIs**
- 更新範例程式
**4.3.2 回應參數-建立完成**
- 新增參數AuthBank收單機構英文代
碼：[LINEBank]
**4.3.3 回應參數-每期授權完成[NPA-N05 0 ]**
- 新增參數AuthBank收單機構英文代
碼：[LINEBank]

2024/ 01 / 18

NDNP-1.0. 4

**4.5.1 請求參數**

- 調整參數［Extday信用卡到期日］參數
格式為［年月］

2024/05/ 15


## 目錄


- 1.簡介
- 2. 詞彙一覽表
- 3. 交易流程
- 4. APIs
   - 4.1 AES256加密
   - 4.2 AES256解密
   - 4.3 建立委託[NPA-B05]
      - 4.3.1 請求參數
      - 4.3.2 回應參數-建立完成
      - 4.3.3 回應參數-每期授權完成[NPA-N050]
   - 4.4 修改委託狀態[NPA-B051]
      - 4.4.1 請求參數
      - 4.4.2 回應參數
   - 4.5 修改委託內容[NPA-B052]
      - 4.5.1 請求參數
      - 4.5.2 回應參數
- 5. 錯誤代碼表
- 6. 常見問題


## 1.簡介

信用卡定期定額服務(Credit Card Periodic Payment)具有數位內容訂閱服務或會員

月費、年費等服務類型的商店，提供便捷收款模式。商店可依需求建立定期定

額委託，消費者只需完成一次結帳，藍新金流將於商店及消費者所約定之扣款

週期，由系統自動執行信用卡扣款，解決商店每期收款需求。中間可以修改約

定的金額或是週期，也可執行暫停、繼續、或終止扣款。


## 2. 詞彙一覽表

\`\`\`
名稱 說明
藍新金流 藍新金流提供金流服務給商店，並提供付款頁面給消費者進行付款
會員 使用藍新金流服務之會員，一個會員可以建立多間商店
商店 會員建立使用藍新金流服務之網路商店
消費者 向商店購買商品或服務之付款方，可能為商店之會員
\`\`\`
委託

\`\`\`
商店與消費者約定一筆『固定扣款的週期及金額』，稱之為一筆委
託，是定期定額型交易的單位。一筆委託將會帶來多期扣款。
\`\`\`
_P 1_ (^) 定期定額委託之扣款首期
_Pn_ (^) 定期定額委託之後續扣款期數
會員專區
涵蓋藍新會員的各項商店、銷售紀錄、金流等功能
登入網址為https://www.newebpay.com/
收單機構 提供商店信用卡交易清算服務之銀行


## 3. 交易流程

本章節介紹信用卡定期定額之交易流程及相關規則。

一筆 **信用卡定期定額** ，起於 **建立委託 (NPA-B05)** 。建立成功後，系統會自動按

時扣款，直到排定期數完成為止。過程中，亦可進行 **修改委託狀態 (NPA-B051)**

及 **修改委託內容 (NPA-B052)** 修改委託(如圖 1 定期定額交易狀態圖)。

##### 圖 1 定期定額交易狀態圖


其API交易流程如下：

1. 消費者購買訂閱型服務或商品，並開始結帳

2. 商店向藍新金流執行建立委託 API (參照 4. 3 建立委託[NPA-B05])

3. 藍新金流將商店網頁轉導至定期定額付款頁面，提供消費者進行付款流程

(參照圖 6 定期定額支付頁)

4. 消費者於定期定額支付頁輸入卡號等必要資訊

5. 首期授權方式依驗證情境共分為三種：

##### 圖 2 三種定期定額驗證方式流程圖


⚫ **立即十元驗證** (參照圖 3 「立即十元」驗證交易流程圖)

委託建立當下，立即執行一 **筆十元** 信用卡授權

十元授權成功：立即取消十元授權，並委託成立

十元授權失敗：委託不成立

⚫ **立即首期(P 1 )驗證** (參照圖 4 「立即首期」驗證交易流程圖)

委託建立當下，立即執行 **委託金額** 授權

授權成功：委託成立

授權失敗：委託不成立

⚫ **指定首期(P 1 )驗證** (參照圖 5 「指定首期」驗證交易流程圖)

委託自動成立，於 **指定首期授權日** 再執行授權

授權失敗：委託不成立

6. 商店向藍新金流發動修改委託狀態 API (參照 4 .4 修改委託狀態[NPA-

B051])，可將委託狀態由【啟用】改為【暫停】或【終止】

⚫ 委託狀態若為【終止】，則無法執行此 API

⚫ 如有首期授權日之委託，於授權日���日前，僅能執行【終止】

授權日隔日起，方能執行【啟用】及【暫停】

7. 商店向藍新金流發動修改委託內容 API (參照 4 .5 修改委託內容[NPA-

B052])，僅可調整委託之每期 **授權金額、執行週期、信用卡到期日、授權總期**

**數及NotifyURL**

⚫ 委託狀態若為【終止】或【暫停】，則無法執行此 API

⚫ 如有首期授權日之委託，於授權日隔日前，無法執行此 API

***修改委託狀態(NPA-B051)及修改委託內容(NPA-B05 2 )為申請制，需向藍新金流**

**提出申請，待設定完成後，方能執行**


##### 圖 3 「立即十元」驗證交易流程圖


##### 圖 4 「立即首期」驗證交易流程圖


##### 圖 5 「指定首期」驗證交易流程圖

##### 圖 6 定期定額支付頁


##### 圖 7 定期定額支付完成結果頁


## 4. APIs

本章節將依序介紹發動交易前的加/解密方式，以及 **建立委託 ( NPA-B05)** 、 **修**

**改委託狀態 (NPA-B051)** 及 **修改委託內容 (NPA-B052)** ，共計三支API介接規

格，以及發動時機。

### 4.1 AES256加密

**Step 0: 準備基本要素**

1. 於藍新金流平台已建立商店，並已啟用定期定額支付工具
2. 將商店之API串接金鑰(Hash Key, Hash IV)及商店代號(Merchant ID)複製至原

始碼

PHP範例如下:

\`\`\`
$key="IaWudQJsuOT994cpHRWzv7Ge67yC1cE3";
$iv="C1dLm3nxZRVlmBSP";
$mid="TEK1682407426";
\`\`\`

**Step 1: 生成請求字串**

參考 4 .3.1 請求參數，帶入必要參數，並生成URL字串

PHP範例如下：

\`\`\`
$data1=http_build_query(array(
'RespondType'=>'JSON',
'TimeStamp'=>time(),
'Version'=>'1.5',
'LangType'=>'zh-Tw',
'MerOrderNo'=>'myorder'.time(),
'ProdDesc'=>'Test commssion',
'PeriodAmt'=>'10',
'PeriodType'=>'M',
'PeriodPoint'=>'05',
'PeriodStartType'=>'2',
'PeriodTimes'=>'12',
'PayerEmail'=>'test@neweb.com.tw',
'PaymentInfo'=>'Y',
'OrderInfo'=>'N',
'EmailModify'=>'1',
'NotifyURL'=>'https://webhook.site/b728e917-1bf7-478b-b0f9-
73b56aeb44e0',
\`\`\`
));

執行完成後，$data1內容如下：

RespondType=JSON&TimeStamp=1700033460&Version=1.5&LangType=zh

-
Tw&MerOrderNo=myorder1700033460&ProdDesc=Test+commssion&Perio
dAmt=10&PeriodType=M&PeriodPoint=05&PeriodStartType=2&PeriodT
imes=12&PayerEmail=test%40neweb.com.tw&PaymentInfo=Y&OrderInf
o=N&EmailModify=1&NotifyURL=https%3A%2F%2Fwebhook.site%2Fb
e917-1bf7-478b-b0f9-73b56aeb44e


**Step2: 將請求字串加密**

為防止信用卡號等重要交易訊息洩漏，需於加密前使用商店之 Hash Key 及

Hash IV 對上述字串執行 AES- 256 - CBC (使用 PKCS7 填充)，並將結果轉換至十

六進制。

由於PHP中的openssl_encrypt函式提供帶有 OPENSSL_RAW_DATA 的PKCS 7 ，

PHP範例如下：

\`\`\`
$edata1=bin2hex(openssl_encrypt($data1, "AES- 256 - CBC", $key,
OPENSSL_RAW_DATA, $iv));
\`\`\`
執行完成後，$edata1加密後內容如下：

\`\`\`
45d5175feaa9ef2ea039f84afba34c6330e8fa21ae01ec40f15ab00073b4e
93584cc1d3a7e2b26feb08216d14074dd4a83a64791e114cd15e200a88ef
8720e7830d892953a25b84411abc8d0f86ff73719af52e0c303de9586c
702e806e599ffd739086b0c3f8c3b995b2a6ba92902070f5f8c4c2916f72b
0d9c1027ca050799a6a55e78ff07c663e4b90aa3a84dfde353f1354fc
ccc897f5ee0586a2852e2e5e1be1f3fa2f7a618377abdab9b6aa3af39eb
5e461aaa2c8da4d2fd3af93bed9eb3438b01804a9a1bc39bcb6f7bd3a35bd
275fe53923960bd76c4def1175e8b1f60acb21cd4ebe9c03fe10df2c1a6aa
455e21899c02cba501ce2fb87c72a6cbb2a146ddd4688fd3ce9cf068bdb6f
4f2c4351d78973d32268737e931def628d0f3f3aac038cd551a0f8c85e0d
94542da74f6ba841c4068bab0f14453dbac0d16dba1de2656368238855dc
351821380a3455532a2259c2c5caf4cac
\`\`\`

### 4.2 AES256解密

**Step 3 : 發布請求**

參考 4 .3.1 請求參數，將必要參數以HTML form形式組合，並發佈於下列API

URL：

以下為HTML範例：

\`\`\`
<form method=post
action="https://ccore.newebpay.com/MPG/period">
MI: <input name="MerchantID_" value="<?=$mid?>"
readonly><br>
PostData_: <input name="PostData_" value="<?=$edata1?>"
readonly type="hidden"><?=$edata1?><br>
<input type=submit value='Submit'>
\`\`\`
</form>


**Step4: 結果**

消費者完成支付後，藍新金流即透過NotifyURL回傳已加密字串給商店，範例如

下：

\`\`\`
[Period] =>
e88f62186b6d5dd96a9f6dbc57a84547957e8cb8534d81cbed42dcffa
3a30fad037c450ed467d60f44e51b3525829e204ae0d3792a9f2c7e8af7df
196ddc678579b76f76f64f0322f7e41587076372b69023b1681d022d219f
8deced25f941e5902905f4f5009d84aa35f1c4dc0cee9bbd4ba9a
927a14ff86f46259388845ba59a1c59c3007bf5534bae63616e1e705a63dc
9615d3be00d4bf04f04af1ebc229f34e34c80b31d14d39f519099650bfaa
f9228ad15c7f79797d3ada0ba648bb33a8fd82937061e83b2916b
d52cff39adb1b0d1204d9e07b3f79d709344852579671c68d8844348b80f
a35450d860b232f3aeb7728c24135e438f0893089e445bdc62429126a5b
c7e09b1226e05d53127498fbcf407f241c8d752298a29642df3671f8277b
849370d2234a69fbfd415ab3449953233a4eaa2e1aa5827f30c482cf8efcd
ecff5587f75045f60336eb2133b658834736642f99305f0d245c0714696a
38b1d9364659f7240c25a1e66d04af35f7f077498dad65b82256342549ba
4e2ff75880ef9fb1e025999ee619eef10388642a09eacebe3c19be1d8077e
e1a73d53a7168e835a13361248a54d83d944b33ace6f8159aa38b9ab0b
bbab3bedb9affcf43a3ae4415c5a657a66ab026f7c53ada3b2920e741fa
c62bf19d21932239a3116ae3ccf0aabf06bb99ddcefb3976dbb75c45599a
7f24fdedbb30e232c969fa2a1d5d1e21258ed21705ae969d97c756e742be
4c7f4c6ed520b35fa5fa1689c40b3f8929f7ee082076cbcf585536e1f2e2f
f1042934eaf57577efd7c403c562b1ea106aaea3e36f69e3eeba8e0ea
\`\`\`

**Step 5 : 將加密字串進行解密**

使用商店之API串接金鑰(Hash Key, Hash IV)進行解密，範例如下:

\`\`\`
<?php
$key="IaWudQJsuOT994cpHRWzv7Ge67yC1cE3";
$iv="C1dLm3nxZRVlmBSP";
\`\`\`
\`\`\`
$data1="e88f62186b6d5dd96a9f6dbc57a84547957e8cb8534d81cbed42d
cffa93783a30fad037c450ed467d60f44e51b3525829e204ae0d3792a9f2c
7e8af7df196ddc678579b76f76f64f0322f7e41587076372b69023b1681d
22d219f78deced25f941e5902905f4f5009d84aa35f1c4dc0cee9bbd4ba9a
67228775927a14ff86f46259388845ba59a1c59c3007bf5534bae63616e1e
705a63dc9615d3be00d4bf04f04af1ebc229f34e34c80b31d14d39f
650bfaa7f9228ad15c7f79797d3ada0ba648bb33a8fd82937061e83b2916b
92510617d52cff39adb1b0d1204d9e07b3f79d709344852579671c68d
348b80f4a35450d860b232f3aeb7728c24135e438f0893089e445bdc
126a5b37c7e09b1226e05d53127498fbcf407f241c8d752298a29642df
1f8277b9849370d2234a69fbfd415ab3449953233a4eaa2e1aa5827f30c
2cf8efcdecff5587f75045f60336eb2133b658834736642f99305f0d245c
714696a238b1d9364659f7240c25a1e66d04af35f7f077498dad65b
42549ba34e2ff75880ef9fb1e025999ee619eef10388642a09eacebe3c19b
e1d8077ee1a73d53a7168e835a13361248a54d83d944b33ace6f8159aa38b
9ab0b408bbab3bedb9affcf43a3ae4415c5a657a66ab026f7c53ada3b
e741fa19c62bf19d21932239a3116ae3ccf0aabf06bb99ddcefb3976dbb
c45599a17f24fdedbb30e232c969fa2a1d5d1e21258ed21705ae969d97c
6e742be64c7f4c6ed520b35fa5fa1689c40b3f8929f7ee082076cbcf
6e1f2e2ff1042934eaf57577efd7c403c562b1ea106aaea3e36f69e3eeba
e0ea";
\`\`\`
//去除padding副程式

\`\`\`
function strippadding($string) {
$slast = ord(substr($string, -1));
$slastc = chr($slast);
$pcheck = substr($string, -$slast);
\`\`\`

\`\`\`
if (preg_match("/$slastc{". $slast. "}/", $string))
{
$string = substr($string, 0, strlen($string) -
$slast);
return $string;
} else {
return false;
} }
\`\`\`
//主程式

\`\`\`
$edata1=strippadding(openssl_decrypt(hex2bin($data1), "AES-
256 - CBC", $key, OPENSSL_RAW_DATA|OPENSSL_ZERO_PADDING, $iv));
\`\`\`
echo "解密後資料=[<font color=darkblue><gg

id='outtt'>".$edata1."</gg></font>]<br>";

?>

解密結果如下：

\`\`\`
{"Status":"SUCCESS","Message":"\u59d4\u8a17\u55ae\u6210\u7acb
\uff0c\u4e14\u9996\u6b21\u6388\u6b0a\u6210\u529f","Result":{"
MerchantID":"TEK1682407426","MerchantOrderNo":"myorder
460","PeriodType":"M","PeriodAmt":"10","AuthTimes":12,"DateAr
ray":"2023- 11 - 15,2023- 12 - 05,2024- 01 - 05,2024- 02 - 05,2024- 03 -
05,2024- 04 - 05,2024- 05 - 05,2024- 06 - 05,2024- 07 - 05,2024- 08 -
05,2024- 09 - 05,2024- 10 -
05","TradeNo":"23111515321368339","AuthCode":"230297","Respon
dCode":"00","AuthTime":"20231115153213","CardNo":"400022*****
*1111","EscrowBank":"HNCB","AuthBank":"KGI","PeriodNo":"P
15153213aMDNWZ","PaymentMethod":"CREDIT"}}
\`\`\`

### 4.3 建立委託[NPA-B05]

測試串接網址：https://ccore.newebpay.com/MPG/period

正式串接網址：https://core.newebpay.com/MPG/period

#### 4.3.1 請求參數

Post 參數說明：

\`\`\`
參數名稱 參數中文名稱 必填 型態 備註
\`\`\`
MerchantID_ (^) 商店代號 V String(15) (^) 藍新金流商店代號
PostData_ 加密後參數 V Text AES加密後的資料^
請參考 4 .1 AES256加密
PostData_參數說明：
參數名稱 參數中文名稱 必填 型態 備註
RespondType 回傳格式 V String(5) JSON或是String
TimeStamp (^) 時間戳記 V String(30)
自從Unix 纪元（格林威治時間 1970
年 1 月 1 日 00:00:00）到當前時間
的秒數，若以PHP程式語言為例，即
為呼叫time()函式所回傳值
例： 2014 - 05 - 15 15:00:00這個時間的時
間戳記為 1400137200
*須確實帶入自Unix紀元到當前時間的
秒數以避免交易失敗。(容許誤差值
120 秒)
Version (^) 串接程式版本 V String(5) 1 .5
LangType (^) 語系 String(5)

##### 1.設定委託頁面顯示語系

\`\`\`
英文版= en
繁體中文版= zh-Tw
2.當未提供此參數或此參數數值錯誤
時，將預設為繁體中文版。
\`\`\`
\`\`\`
MerOrderNo 商店訂單編號 V String(30)
\`\`\`
##### 1. 商店自訂訂單編號，限英、數

##### 字、”_ ”格式”

\`\`\`
例： 201406010001
2 .同一商店中此編號不可重覆
\`\`\`

ProdDesc (^) 產品名稱 V String(100)

##### 1.此委託商品或服務名稱

##### 2 .僅限制使用中文、英文、數字、空格

##### 及底線，若內容必須含有特殊符號請

##### 自行轉為全形

PeriodAmt (^) 委託金額 V Int(6)

##### 1.需為大於 0 的整數

##### 2 .純數字不含符號，例： 1000

##### 3 .幣別：新台幣

\`\`\`
PeriodType 週期類別 V String(1)
\`\`\`
##### 1.此委託授權交易週期類別

##### D=固定天期制

##### W=每週

##### M=每月

##### Y=每年

##### 2.授權週期：固定天期(2- 999 天)，以授

##### 權日期隔日起算

##### 3.每月授權若當月沒該日期則由該月最

##### 後一天做為扣款日

##### 4.每次委託每個期別僅能授權一次，若

##### 需授權多次，請建立多張委託

PeriodPoint 交易週期^
授權時間

\`\`\`
V String(4)
\`\`\`
##### 1.修改此委託於週期間，執行信用卡授

##### 權交易的時間點

\`\`\`
2.當PeriodType = D，此欄位值限為數
字2~999，以授權日期隔日起算。
例：數值為 2 ，則表示每隔兩天會執
行一次委託
3.當PeriodType =W，此欄位值限為數
字1~7，代表每週一至週日。
例：每週日執行授權，則此欄位值
為 7 ；若週日與週一皆需執行授權，請
分別建立 2 張委託
3.當PeriodType = M，此欄位值限為數
字01~31，代表每月 1 號~31號。若當
月沒該日期則由該月的最後一天做為
扣款日
例：每月 1 號執行授權，則此欄位
值為 01 ；若於 1 個月內需授權多次，
請以建立多次委託方式執行。
5.當PeriodType =Y，此欄位值格式為
MMDD
\`\`\`

##### 例：每年的 3 月 15 號執行授權，則

##### 此欄位值為 0315 ；若於 1 年內需授權

##### 多次，請以建立多次委託方式執行

PeriodStartType (^) 交易模式 V Int(1)

##### 此委託成立後，是否立即進行信用卡

##### 授權交易，作為檢查信用卡之有效性

##### １=立即執行十元授權

##### ２=立即執行委託金額授權

##### ３=不檢查信用卡資訊，不授權

PeriodTimes (^) 授權期數 V String(2)

##### 1.此委託執行信用卡授權交易的次數

##### 2.若授權期數大於信用卡到期日，則系

##### 統自動以信用卡到期日為最終期數。

\`\`\`
例：PeriodType = M，於2016/10/1建立
委託，授權期數為 12 ，而付款人之信
用卡到期月/年為12/16時，則此張委託
之授權期數為 3 ，2016/10月、 11 月、
12 月，共 3 期
\`\`\`
PeriodFirstdate (^) 首期授權日 String(10)

##### 1.可以指定首期授權日期，此日期當天

##### 會執行第 1 次授權，隔日為授權週期起

\`\`\`
算日。格式為『YYYY/mm/dd』
如:2021/03/31
例:當PeriodType=D,PeriodTimes=40,
PeriodFirstdate=2020/12/22時，則藍新
金流將於2020/12/22當天發動第 1 期授
權，2020/12/23後每隔 40 天發動授權
2.本欄位只有PeriodType=D及
PeriodStartType=3時���效
(兩條件須同時滿足)
\`\`\`
3. 首期授權日(含當日)執行後，方可執
行修改委託功能
    例:首期授權日設定為2022/1/1，於
2022/1/2 凌晨 0 點前，將無法執行修改
委託動作

\`\`\`
ReturnURL 返回商店網址 String(100)
\`\`\`
##### 1.當付款人首次執行信用卡授權交易完

\`\`\`
成後，以 Form Post 方式導回商店頁
2.若此欄位為空值，交易完成後，付款
人將停留在藍新金流交易完成頁面
PeriodMemo 備註說明 String(255) 此委託備註說明
\`\`\`

\`\`\`
PayerEmail 付款人電子信箱 V String(50) 於交易完成或付款完成時，通知付款
人使用
\`\`\`
EmailModify 付款人電子信箱
是否開放修改

\`\`\`
Int(1)
\`\`\`
##### 1.設定於付款頁面，付款人電子信箱欄

##### 位是否開放讓付款人修改

##### 1=可修改

##### 0=不可修改

##### 2.當未提供此參數時，預設值為 1

PaymentInfo 是否開啟^
付款人資訊

\`\`\`
String(1)
\`\`\`
##### 1.於付款人填寫此委託時，是否需顯示

##### 付款人資訊填寫欄位

##### Ｙ＝是

##### Ｎ＝否

##### 2.若未提供此參數，預設值為Y

##### 3.付款人資訊填寫欄位包含付款人姓

##### 名、付款人電話、付款人手機

\`\`\`
OrderInfo 是否開啟^
收件人資訊
\`\`\`
\`\`\`
String(1)
\`\`\`
##### 1.於付款人填寫此委託時，是否需顯示

##### 收件人資訊填寫欄位

##### Ｙ＝是

##### Ｎ＝否

##### 2.若未提供此參數，則預設為Y

##### 3.收件人資訊填寫欄位包含收件人姓

##### 名、收件人電話、收件人手機、收件

##### 人地址

\`\`\`
NotifyURL 每期授權^
結果通知網址
\`\`\`
\`\`\`
String(100)
\`\`\`
##### 1.當付款人每期執行信用卡授權交易完

\`\`\`
成後，以幕後Post方式通知商店授權
結果
2.若此欄位為空值，則不通知商店授權
結果
\`\`\`
BackURL (^) 返回商店網址 String(100) (^) 取消交易時返回商店的網址

##### UNIONPAY 信用卡^

##### 銀聯卡啟用

\`\`\`
Int(1)
\`\`\`
##### 設定是否啟用銀聯卡支付方式

##### 1=啟用

##### 0 或者未有此參數=不啟

##### *銀聯卡僅支援幕後非3D交易


**PHP程式範例：**

\`\`\`
<?php
$key="IaWudQJsuOT994cpHRWzv7Ge67yC1cE3";
$iv="C1dLm3nxZRVlmBSP";
$mid="TEK1682407426";
\`\`\`
\`\`\`
$data1=http_build_query(array(
'RespondType'=>'JSON',
'TimeStamp'=>time(),
'Version'=>'1.5',
'LangType'=>'zh-Tw',
'MerOrderNo'=>'myorder'.time(),
'ProdDesc'=>'Test commssion',
'PeriodAmt'=>'10',
'PeriodType'=>'M',
'PeriodPoint'=>'05',
'PeriodStartType'=>'2',
'PeriodTimes'=>'12',
'PayerEmail'=>'test@neweb.com.tw',
'PaymentInfo'=>'Y',
'OrderInfo'=>'N',
'EmailModify'=>'1',
'NotifyURL'=>'https://webhook.site/b728e917-1bf7-478b-b0f9-
73b56aeb44e0',
\`\`\`
));

\`\`\`
$edata1=bin2hex(openssl_encrypt($data1, "AES- 256 - CBC", $key,
OPENSSL_RAW_DATA, $iv));
\`\`\`
?>

\`\`\`
NWP Test – Periodic <br>
Press 'submit' to pay.
\`\`\`

加密前=<?=$data1?><br>

加密後=<?=$edata1?><br>

<form method=post
action="https://ccore.newebpay.com/MPG/period">
MI: <input name="MerchantID_" value="<?=$mid?>"
readonly><br>
PostData_: <input name="PostData_" value="<?=$edata1?>"
readonly type="hidden"><?=$edata1?><br>
<input type=submit value='Submit'>

</form>


#### 4.3.2 回應參數-建立完成

回傳欄位：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
\`\`\`
Period 回傳結果 Text AES加密後的回傳結果^
其內容如下列回傳參數說明
\`\`\`
回傳參數說明：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
Status (^) 回傳狀態 String(10)

##### 1.若委託成功，則回傳SUCCESS

##### 2.若委託失敗，則回傳錯誤代碼

##### 錯誤代碼請參考 5. 錯誤代碼表

Message (^) 回傳訊息 String(30) (^) 文字，敘述此次交易狀態
Result (^) 回傳資料 JSON (^) 內容格式為JSON
Result參數說明：
參數名稱 參數中文名稱 型態 備註
MerchantID 商店代號 String(15) 藍新金流商店代號
MerchantOrderNo (^) 商店訂單編號 String (30) (^) 商店自訂訂單編號
PeriodType (^) 週期類別 String( 1 ) (^) 委託週期
AuthTimes 授權次數 Int(6) 此委託總授權期數
DateArray 授權排程日期 Text 顯示委託所有授權日期排程
PeriodAmt (^) 每期金額 INT(6) (^) 委託每期金額
PeriodNo (^) 委託單號 String(20) (^) 委託單號
PeriodStartType參數值為 1 或 2 時，則新增回傳參數如下
參數名稱 參數中文名稱 型態 備註
AuthTime 授權時間 String(14) 每期授權時間
TradeNo 藍新金流^
交易序號
String (20) (^) 藍新金流交易序號
CardNo (^) 卡號前六後四碼 String (16) (^) 卡號前六與後四碼
AuthCode (^) 授權碼 String (6) (^) 銀行回覆當下該筆交易之授權碼


\`\`\`
RespondCode 銀行回應碼 String (3) 銀行回應碼^00 代表刷卡成功^
其餘為刷卡失敗
\`\`\`
EscrowBank (^) 款項保管銀行 String(10)

##### 1.該筆交易款項保管銀行

##### 2.如商店是直接與銀行簽約的信用卡特約商

##### 店，當使用信用卡支付時，本欄位會回傳

##### 空值

##### 3.款項保管銀行英文代碼與中文名稱對應如

##### 下：

##### HNCB=華南銀行

AuthBank (^) 收單機構 String(10)

##### 1.該筆交易的收單機構

##### 2.收單機構英文代碼與中文名稱對應如下：

\`\`\`
Esun=玉山銀行
Taishin=台新銀行
NCCC=聯合信用卡
CathayBK=國泰世華銀行
CTBC=中國信託銀行
UBOT=聯邦銀行
LINEBank=連線商業銀行
\`\`\`
PaymentMethod (^) 交易類別 String(20)

##### 將依據此筆交易之信用卡類別回傳相對應

##### 的參數，對應參數如下：

##### CREDIT =台灣發卡機構核發之信用卡

##### UNIONPAY =銀聯卡

**回傳結果範例-Period(已加密)：**

\`\`\`
e88f62186b6d5dd96a9f6dbc57a84547957e8cb8534d81cbed42dcffa9378
3a30fad037c450ed467d60f44e51b3525829e204ae0d3792a9f2c7e8af7df
196ddc678579b76f76f64f0322f7e41587076372b69023b1681d022d219f7
8deced25f941e5902905f4f5009d84aa35f1c4dc0cee9bbd4ba9a67228775
927a14ff86f46259388845ba59a1c59c3007bf5534bae63616e1e705a63dc
9615d3be00d4bf04f04af1ebc229f34e34c80b31d14d39f519099650bfaa7
f9228ad15c7f79797d3ada0ba648bb33a8fd82937061e83b2916b92510617
d52cff39adb1b0d1204d9e07b3f79d709344852579671c68d8844348b80f4
a35450d860b232f3aeb7728c24135e438f0893089e445bdc62429126a5b37
c7e09b1226e05d53127498fbcf407f241c8d752298a29642df3671f8277b9
849370d2234a69fbfd415ab3449953233a4eaa2e1aa5827f30c482cf8efcd
ecff5587f75045f60336eb2133b658834736642f99305f0d245c0714696a2
\`\`\`

\`\`\`
38b1d9364659f7240c25a1e66d04af35f7f077498dad65b82256342549ba3
4e2ff75880ef9fb1e025999ee619eef10388642a09eacebe3c19be1d8077e
e1a73d53a7168e835a13361248a54d83d944b33ace6f8159aa38b9ab0b408
bbab3bedb9affcf43a3ae4415c5a657a66ab026f7c53ada3b2920e741fa19
c62bf19d21932239a3116ae3ccf0aabf06bb99ddcefb3976dbb75c45599a1
7f24fdedbb30e232c969fa2a1d5d1e21258ed21705ae969d97c756e742be6
4c7f4c6ed520b35fa5fa1689c40b3f8929f7ee082076cbcf585536e1f2e2f
f1042934eaf57577efd7c403c562b1ea106aaea3e36f69e3eeba8e0ea
\`\`\`
**回傳結果範例-Period(解密後)：**

"Status":"SUCCESS",

- "Message":"委託單成立，且首次授權成功",
- "Result":{
o "MerchantID":"TEK1682407426",
o "MerchantOrderNo":"myorder1700033460",
o "PeriodType":"M",
o "PeriodAmt":"10",
o "AuthTimes": 12 ,
o "DateArray":" 2023 - 11 - 15,2023- 12 - 05,2024- 01 - 05,2024- 02 -
    05,2024- 03 - 05,2024- 04 - 05,2024- 05 - 05,2024- 06 - 05,2024- 07 -
    05,2024- 08 - 05,2024- 09 - 05,2024- 10 - 05 ",
o "TradeNo":"23111515321368339",
o "AuthCode":"230297",
o "RespondCode":"00",
o "AuthTime":"20231115153213",
o "CardNo":"400022******1111",
o "EscrowBank":"HNCB",
o "AuthBank":"KGI",
o "PeriodNo":"P231115153213aMDNWZ",
o "PaymentMethod":"CREDIT"}

}


#### 4.3.3 回應參數-每期授權完成[NPA-N050]

回傳欄位：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
\`\`\`
Period 回傳結果 Text AES加密後的回傳結果^
其內容如下列回傳參數說明
\`\`\`
回傳參數說明：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
Status (^) 回傳狀態 String(10)

##### 1.授權成功，則回傳SUCCESS

##### 2.授權失敗，則回傳錯誤代碼

##### 錯誤代碼請參考 5. 錯誤代碼表

Message (^) 回傳訊息 String(30) (^) 委託授權結果
Result (^) 回傳資料 JSON (^) 內容格式為JSON
Result參數說明：
參數名稱 參數中文名稱 型態^ 備註
RespondCode (^) 銀行回應碼 String(3) 銀行回應碼^00 代表刷卡成功^
其餘為刷卡失敗
MerchantID 商店代號 String(15) 藍新金流商店代號
MerchantOrderNo (^) 商店訂單編號 String (30) (^) 商店自訂訂單編號
OrderNo (^) 自訂單號 String (30) (^) 商店訂單編號_期數
TradeNo 藍新金流^
交易序號
String (20) 藍新金流交易序號
AuthDate (^) 授權時間 String ( 19 ) (^) 委託之本期授權時間(Y-m-d h:i:s)
TotalTimes 總期數 String(４) 委託之總授權期數
AlreadyTimes (^) 已授權次數 String(4) 委託之已授權期數^
包含授權失敗期數
AuthAmt 授權金額 Int(10) 委託單本期授權金額
AuthCode (^) 授權碼 String (6) (^) 銀行回覆當下該筆交易之授權碼
EscrowBank (^) 款項保管銀行 String(10)

##### 1.該筆交易款項保管銀行

##### 2.如商店是直接與銀行簽約的信用卡特約商

##### 店，當使用信用卡支付時，本欄位會以空

##### 值回傳


##### 3.款項保管銀行英文代碼與中文名稱對應如

##### 下：

##### HNCB=華南銀行

\`\`\`
AuthBank 收單機構 String(10)
\`\`\`
##### 1.該筆交易的收單機構

##### 2.收單機構英文代碼與中文名稱對應如下：

\`\`\`
Esun=玉山銀行
Taishin=台新銀行
NCCC=聯合信用卡
CathayBK=國泰世華銀行
CTBC=中國信託銀行
UBOT=聯邦銀行
LINEBank=連線商業銀行
\`\`\`
NextAuthDate (^) 下次授權日期 DateTime 下期委託授權日期(Y-m-d)^
授權當期若為最後一期，則回覆該期日期
PeriodNo 委託單號 String(20) 委託單號


**回傳結果範例-Period(解密後)：**

Array ( [Status] => SUCCESS [Message] => 授權成功 [Result] =>

\`\`\`
Array ( [RespondCode] => 00 [MerchantID] => MS12345678
[MerchantOrderNo] => periodi1655708272 [OrderNo] =>
periodi1655708272_2 [TradeNo] => 22062407181613548 [AuthDate]
=> 2022- 06 - 24 07:18:17 [TotalTimes] => 12 [AlreadyTimes] => 2
[AuthAmt] => 20 [NextAuthDate] => 2022- 06 - 26 [AuthCode] =>
681234 [PeriodNo] => P220620145859us4Rlj ) )
\`\`\`

### 4.4 修改委託狀態[NPA-B051]

測試環境串接：https://ccore.newebpay.com/MPG/period/AlterStatus

正式環境串接：https://core.newebpay.com/MPG/period/AlterStatus

#### 4.4.1 請求參數

Post 參數說明：

\`\`\`
參數名稱 參數中文名稱 必填 型態 備註
\`\`\`
MerchantID_ (^) 商店代號 V String(15) (^) 藍新金流商店代號
PostData_ 加密後參數 V Text AES加密後的資料^
請參考 4 .1 AES256加密
PostData_參數說明：
參數名稱 參數中文名稱 必填 型態 備註
RespondType 回傳格式 V String(5) JSON或是String
Version 串接程式版本 V String(5) 1.0
MerOrderNo (^) 商店訂單編號 V String(30)

##### 1.商店自訂訂單編號，限英、數

##### 字、”_ ”格式

##### 例： 201406010001

##### 2 .同一商店中此編號不可重覆

PeriodNo (^) 委託單號 V String(20) (^) 委託單號
AlterType 委託狀態 V String(20)

##### 1.修改委託狀態，請全小寫傳入

\`\`\`
暫停= suspend
終止= terminate
啟用= restart
2 終止委託後無法再次啟用
3 暫停後再次啟用的委託將於最
近一期開始授權
4 委託暫停後再啟用總期數不
變，扣款時間將向後展延至期數
滿期
\`\`\`

TimeStamp (^) 時間戳記 V String(30)
自從Unix 纪元（格林威治時間
1970 年 1 月 1 日 00:00:00）
到當前時間的秒數，若以PHP程
式語言為例，即為呼叫time()函
式所回傳值
例： 2014 - 05 - 15 15:00:00這個時
間的時間戳記為 1400137200
*須確實帶入自Unix紀元到當前時
間的秒數以避免交易失敗。(容許
誤差值 120 秒)
**PHP程式範例：**
<?php
$key="IaWudQJsuOT994cpHRWzv7Ge67yC1cE3";
$iv="C1dLm3nxZRVlmBSP";
$mid="TEK1682407426";
$data1=http_build_query(array(
'RespondType'=>'JSON',
'TimeStamp'=>time(),
'Version'=>'1.0',
'LangType'=>'zh-Tw',
'MerOrderNo'=>'myorder1700033460',
'PeriodNo'=>'P231115153213aMDNWZ',
'AlterType'=>'suspend',
));
$edata1=bin2hex(openssl_encrypt($data1, "AES- 256 - CBC", $key,
OPENSSL_RAW_DATA, $iv));
?>
NWP Test – Periodic <br>
Press 'submit' to pay.
加密前=<?=$data1?><br>


加密後=<?=$edata1?><br>

<form method=post
action="https://ccore.newebpay.com/MPG/period/AlterStatus">
MI: <input name="MerchantID_" value="<?=$mid?>"
readonly><br>
PostData_: <input name="PostData_" value="<?=$edata1?>"
readonly type="hidden"><?=$edata1?><br>
<input type=submit value='Submit'>

</form>


#### 4.4.2 回應參數

回傳欄位：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
\`\`\`
period 回傳結果 Text AES加密後的回傳結果^
其內容如下列回傳參數說明
\`\`\`
回傳參數說明：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
Status (^) 回傳狀態 String(10)

##### 1.若修改成功，則回傳SUCCESS

##### 2.若修改失敗，則回傳錯誤代碼

##### 錯誤代碼請參考 5. 錯誤代碼表

Message (^) 回傳訊息 String(30) (^) 文字，敘述此次交易狀態
Result (^) 回傳資料 JSON (^) 內容格式為JSON
Result參數說明：
參數名稱 參數中文名稱 型態^ 備註
MerOrderNo 商店訂單編號 String(30) 商店自訂訂單編號
PeriodNo (^) 委託單號 String(30) (^) 委託單號
AlterType (^) 委託狀態 String(20) (^) 該委託目前狀態
NewNextTime 下一期授權日期 String(8) 重新啟用之委託下一次授權日期


**回傳結果範例-period(已加密)：**

\`\`\`
e88f62186b6d5dd96a9f6dbc57a84547957e8cb8534d81cbed42dcffa9378
3a32940ba6716e1ebb85f3d92fbcf0497897d312c0181e878b2d1be5cafe7
d7c2f81ab3327ed1b4529ced6c5c4c6d07c52e9943e9ec8f0735e8c9329c2
3789e3927e540f8f2a56517ddf37d6ee7196d41e0139d173616ccf964b407
64109f8647851cf17a5eb3d75eb0fe017d45790e528528c59adfe84cf2518
dbf7cf71776bed9768ca6a74103332dbfb7d0356fbeb230d9bcda35763ca6
eaaad51033ab6f35195780ea6ac3f584adc78940e9a053858b657461a94a2
0942fd559f54f9843433a
\`\`\`
**回傳結果範例-period(解密後)：**

{

- "Status":"SUCCESS",
- "Message":"該定期定額委託單暫停成功",
- "Result":{
o "MerOrderNo":"myorder1700033460",
o "PeriodNo":"P231115153213aMDNWZ",
o "AlterType":"suspend"

}

}


### 4.5 修改委託內容[NPA-B052]

測試串接網址：https://ccore.newebpay.com/MPG/period/AlterAmt

正式串接網址：https://core.newebpay.com/MPG/period/AlterAmt

#### 4.5.1 請求參數

Post 參數說明：

\`\`\`
參數名稱 參數中文名稱 必填 型態 備註
\`\`\`
MerchantID_ (^) 商店代號 V String(15) (^) 藍新金流商店代號
PostData_ 加密後參數 V Text AES加密後的資料^
請參考 4 .1 AES256加密
PostData_參數說明：
參數名稱 參數中文名稱 必填 型態 備註
RespondType 回傳格式 V String(5) JSON或是String
Version 串接程式版本 V String(5) 1. 2
TimeStamp 時間戳記 V String(30)
自從Unix 纪元（格林威治時間 1970
年 1 月 1 日 00:00:00）到當前時間的
秒數，若以PHP程式語言為例，即為呼
叫time()函式所回傳值
例： 2014 - 05 - 15 15:00:00這個時間的時
間戳記為 1400137200
*須確實帶入自Unix紀元到當前時間的
秒數以避免交易失敗。(容許誤差值 120
秒)
MerOrderNo 商店訂單編號 V String(30)

##### 1.商店自訂訂單編號，限英、數字、”_ ”

##### 格式

##### 例： 201406010001

##### 2 .同一商店中此編號不可重覆

PeriodNo (^) 委託單號 V String(20) (^) 委託單號
AlterAmt 委託金額 + Int(6)

##### 1.需為大於 0 的整數

##### 2.純數字不含符號，例： 1000

##### 3.幣別：新台幣

PeriodType (^) 週期類別 + String(1) 1.修改尚未授權之授權交易週期類別^
D=固定天期制


##### W=每週

##### M=每月

##### Y=每年

##### 2.授權週期：固定天期(2- 999 天)，以授

##### 權日期隔日起算

##### 3.每月授權若當月沒該日期則由該月最

##### 後一天做為扣款日

\`\`\`
4.若需修改此參數，則【PeriodPoint】
為必填
\`\`\`
\`\`\`
PeriodPoint 交易週期^
授權時間
\`\`\`
\`\`\`
+ String(4)
\`\`\`
##### 1.修改此委託於週期間，執行信用卡授

##### 權交易的時間點

\`\`\`
2.當PeriodType = D，此欄位值限為數字
2~999，以授權日期隔日起算
例：數值為 2 ，則表示每隔兩天會執
行一次委託
3.當PeriodType =W，此欄位值限為數字
1~7，代表每週一至週日
例：每週日執行授權，則此欄位值為
7 ；若週日與週一皆需執行授權，請
分別建立 2 次委託
4.當PeriodType = M，此欄位值限為數字
01~31，代表每月 1 號~31號。若當月沒
該日期則由該月的最後一天做為扣款日
例：每月 1 號執行授權，則此欄位
值為 01 ；若於 1 個月內需授權多
次，請以建立多次委託方式執行
5.當PeriodType =Y，此欄位值格式為
MMDD
例：每年的 3 月 15 號執行授權，則
此欄位值為 0315 ；若於 1 年內需授
權多次，請以建立多次委託方式執
行
6.若需修改此參數，【PeriodType】為必
填
\`\`\`
PeriodTimes 授權期數 + String(2)

##### 1.填入要調整的授權總期數，填入數值

##### 不得超過最大總期數

##### 2.如本次有變更信用卡到期日，則此為

##### 必填，且填入數值不得超過最大總期數

##### 3.參數無值，即不修改信用卡到期日


##### 4.若需修改此參數，可不填寫信用卡到

##### 期日

##### 5.修改此參數時，系統將會搭配信用卡

##### 到期日自動計算最大的期數數值，如此

##### 次欲調整期數超過最大可設定期數，將

##### 設定為最大期數

Extday (^) 信用卡到期日 String(4)

##### 1.填入要調整的信用卡到期日，格式為

##### 年月

##### 例： 2021 年 5 月則填入『 2105 』

##### 2.變更信用卡到期日後，系統將會同步

##### 3.參數無值，即不修改信用卡到期日

##### 4.參數修改成功後，自動生效於下一期

##### 授權

NotifyURL 每期授權^
結果通知網址

\`\`\`
String(100)
\`\`\`
\`\`\`
1.若需修改原委託單的NotifyURL，則填
入新的NotifyURL
2.若此欄位為空值或未帶此參數，則不
異動NotifyURL
\`\`\`

**PHP程式範例：**

\`\`\`
<?php
$key="IaWudQJsuOT994cpHRWzv7Ge67yC1cE3";
$iv="C1dLm3nxZRVlmBSP";
$mid="TEK1682407426";
\`\`\`
\`\`\`
$data1=http_build_query(array(
'RespondType'=>'JSON',
'TimeStamp'=>time(),
'Version'=>'1. 2 ',
'MerOrderNo'=>'myorder1700033460',
'PeriodNo'=>'P231115153213aMDNWZ',
'AlterAmt'=>'15'
));
\`\`\`
\`\`\`
$edata1=bin2hex(openssl_encrypt($data1, "AES- 256 - CBC", $key,
OPENSSL_RAW_DATA, $iv));
\`\`\`
?>

\`\`\`
NWP Test – Periodic <br>
Press 'submit' to pay.
\`\`\`
加密前=<?=$data1?><br>

加密後=<?=$edata1?><br>

\`\`\`
<form method=post
action="https://ccore.newebpay.com/MPG/period/AlterAmt ">
MI: <input name="MerchantID_" value="<?=$mid?>"
readonly><br>
PostData_: <input name="PostData_" value="<?=$edata1?>"
readonly type="hidden"><?=$edata1?><br>
<input type=submit value='Submit'>
\`\`\`
</form>


#### 4.5.2 回應參數

回傳欄位：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
\`\`\`
Period 回傳結果 Text AES加密後的回傳結果^
其內容如下列回傳參數說明
\`\`\`
回傳參數說明：

\`\`\`
參數名稱 參數中文名稱 型態 備註
\`\`\`
Status (^) 回傳狀態 String(10)

##### 1.若委託成功，則回傳SUCCESS

##### 2.若委託失敗，則回傳錯誤代碼

##### 錯誤代碼請參考 5. 錯誤代碼表

Message (^) 回傳訊息 String(30) (^) 文字，敘述此次交易狀態
Result (^) 回傳資料 JSON (^) 內容格式為JSON
Result參數說明：
參數名稱 參數中文名稱 型態 備註
MerOrderNo 商店訂單編號 String(30) 商店自訂訂單編號
PeriodNo (^) 委託單號 String(20) (^) 委託單號
AlterAmt (^) 委託金額 Int(6) (^) 委託金額
PeriodType 週期類別 String(1) 修改尚未授權之授權交易週期類別
PeriodPoint 交易週期^
授權時間
String(4) (^) 修改此委託於週期間執行信用卡授權交易的時間點
NewNextAmt 下一期^
授權金額
Int(6) (^) 該委託下一期授權金額
NewNextTime 下一期^
授權時間
String(8) (^) 該委託下一期授權時間
PeriodTimes 授權期數 String(2) 委託總授權期數
Extday 信用卡到期日 String(4) 信用卡到期日，格式為年月
NotifyURL 每期授權^
結果通知網址
String(100) 該委託單之新的NotifyURL，若為”^ –^ “^ 則表示此次
未修改


**回傳結果範例-Period(已加密)：**

\`\`\`
e88f62186b6d5dd96a9f6dbc57a84547957e8cb8534d81cbed42dcffa9378
3a37f1430903fe81f68c67648f607b43a420e9bc9306a6f2c71bff6a0ce50
94beda2c8665044429b98bbd1a81ccb5c88f77c08bfbc31ebb7994bf9f541
c8893b566c1642eb0d8b78a200a11d58541081af1043595748de50098b700
62a111a1e5d38f56b3cca7d74a6aaf21a304fbc5656c716c697add6633b99
03491917a1148957386480db1268ae8814eae992c2d30d693ad4f9936f719
9aa01ea151981e485f257077e7d461ff63a73749348c17a92b88d4895b4d1
854ba2ce7eee340e20d00d3d7cc3ebbdcc60ea67dd154a424b4fc41fe7967
a44bbefe33e4816a53087c5cf0e50e5acead8a65fb53ac38f9fdcafd876f7
aabaf8049a60c5a5369d52f4e9cd19f07b1d93772bca07a51141f298708dc
9fa72ec9f5cad686ce3c79bfca2efec08b7c01bf44c9e76723e491d3a08d1
5fc0f879343b406723d6e99a64072a83e
\`\`\`
\`\`\`
回傳結果範例-Period(解密後)：
{
\`\`\`
- "Status":"SUCCESS",
- "Message":"定期定額委託單修改成功！",
- "Result":{
o "MerOrderNo":"myorder1700033460",
o "PeriodNo":"P231115153213aMDNWZ",
o "AlterAmt":" 1 5",
o "PeriodType": _null_ ,
o "PeriodPoint": _null_ ,
o "NewNextAmt":" 1 5",
o "NewNextTime":"202 3 - 12 - 05 ",
o "PeriodTimes":12,
o "ExtDay":" 2908 ",
o "NotifyURL":"-"

}

}


## 5. 錯誤代碼表

##### 錯誤代碼 錯誤說明

##### ACC10005 會員已被暫時停權/永久停權，請洽藍新金流客服中心查詢

NOR10001 (^) 連線異常
PER10001 商店資料取得失敗
PER10002 資料解密錯誤
PER10003 (^) POST資料傳遞錯誤
PER10004 (^) OOO資料不齊全 (OOO帶入缺少參數)
PER10005 資料不可空白
PER10006 商品名稱不得含有JavaScript語法、CSS語法
PER10007 委託金額格式不對，金額必須為數字^
委託金額超過單筆金額上限
PER10008 委託金額不能為零。^
本API限定為線上商店使用，如需使用請洽客服人員。
PER10009 週期設定錯誤! (W=週,M=月,Y=年)
PER10010 (^) 商店訂單編號錯誤，只允許英數與底線
PER10011 (^) 商店訂單編號長度限制為 30 字
PER10012 回傳格式錯誤，只接受JSON或String
PER10013 日期授權時間資料不正確，日期格式為^2 到^364
週期授權時間資料不正確，日期格式為 1 到7(長度不符)
PER10014 週期授權時間資料不正確，日期格式為 1 到7(長度不符)
PER10015 (^) 月期授權時間資料不正確，日期格式為 01 到 31
PER10016 (^) 月期授權時間資料不正確，日期格式為 01 到31(長度不符)
PER10017 年期授權時間資料不正確，日期格式為 01 到 12
PER10018 年期授權時間資料不正確，日期格式為 01 到 31
PER10019 (^) 定期授權時間資料不正確，無該日期
PER10020 (^) 首期授權模式設定錯誤(1-3)，請檢查
PER10021 (^) 備註說明不得含有JavaScript語法、CSS語法


PER10022 (^) 授權期數格式不對，必須為數字
PER10023 授權期數不能為零
PER10024 授權期數不能多於 99 次
PER10025 (^) 返回商店網址格式錯誤
PER10026 (^) 每期授權通知網址格式錯誤
PER10027 是否開啟付款人資訊設定錯誤

##### PER10028

##### 付款人電子信箱格式錯誤

##### 商品名稱僅限制使用中文、英文、數字、空格及底線，請勿使用其他符

##### 號字

PER10029 (^) 商店代號停用
PER10030 商店信用卡資格停用
PER10031 (^) 商店定期定額資格停用
PER10032 (^) 該訂單編號已重覆
PER10033 (^) 寫入委託單失敗
PER10034 授權失敗，委託單建立失敗
PER10035 委託單更新授權結果失敗
PER10036 (^) 驗證資料錯誤(來源不合法)
PER10037 (^) 付款頁參數不足
PER10038 商品名稱僅限制使用中文、英文、數字、空格及底線，請勿使用其他符
號字元
PER10041 第一期發動日日期不正確
PER10043 銀聯卡參數錯誤
PER10044 (^) 商店銀聯卡資格停用
PER10061 (^) 該定期定額委託單為暫停狀態，無法重複暫停
PER10062 該定期定額委託單為終止狀態，無法暫停
PER10063 該定期定額委託單為啟用狀態，無法重複啟用
PER10064 (^) 該定期定額委託單為終止狀態，無法啟用
PER10065 (^) 該定期定額委託單為終止狀態，無法重複終止
PER10066 (^) Version參數錯誤
PER10067 查無委託單資料


PER10068 (^) 委託單狀態更新失敗
PER10071 該定期定額委託單已暫停無法修改。
PER10072 定期定額委託單為終止狀態無法修改。
PER10073 (^) 此IP不允許執行變更該委託單狀態
PER10074 本API需由藍新金流審核通過後才得以使用，若有串接需求請聯繫客戶
服務中心或商務經理。
PER10075 (^) 該委託單已到期
PER10076 (^) 信用卡到期日參數錯誤
PER10078 警示交易


## 6. 常見問題

⚫ **建立委託[NPA-B0 5 ]**

Q: 委託單建立後沒有自動進行授權的可能原因？

A 1 : 若首期授權成功，但第二期授權因其他原因授權失敗(額度不足等原因)，則

系統仍會自動執行第二期之後期數授權，直到委託單終止。

A 2 : 若委託單執行扣款時，該信用卡狀態為非正常卡，系統將限制該卡無法進

行授權交易，故使用該卡扣款的委託單於限制期間內將不會進行授權，直到限

制期間結束。

Q: 接收回傳Notify無法正常解析的可能原因？

A1: 若您使用的程式語言對於Content-type格式要求規範較嚴謹，如JSP等，可

參考以下JSP程式範例。

**可同時接收Notify及補觸發Notify程式範例：**

\`\`\`
protected void doPost(HttpServletRequest request,
HttpServletResponse response) throws ServletException,
IOException {
try {
String contentType = request.getContentType();
logger.info("contentType==>" + contentType);
if(contentType.startsWith("application/x-www-form-
urlencoded")) {
Enumeration<String> ps =
request.getParameterNames();
while(ps.hasMoreElements()) {
String key = ps.nextElement();
String value = request.getParameter(key);
logger.info("key=" + key + ",value=" + value);
}
}else if(contentType.startsWith("multipart/form-
data")) {
DiskFileItemFactory dfif = new
\`\`\`

DiskFileItemFactory();
ServletFileUpload sfu = new
ServletFileUpload(dfif);
List<FileItem> formItems =
sfu.parseRequest(request);
for(FileItem fi:formItems) {
logger.info("key=" + fi.getFieldName() +
",value=" + fi.getString());
}
}
}catch(Exception e) {
e.printStackTrace();
}
}
