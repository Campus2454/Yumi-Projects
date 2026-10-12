<?php
    if (isset($_COOKIE['lang'])) {
        $lang = $_COOKIE['lang'];
    } else {
        $lang = 'th'; // เริ่มต้นที่ภาษาไทย
    }
?>

<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <link rel="icon" href="/CammingBOT AssetLogo.png">
    <title>Camming Assets</title>
    <style>
        body {
            font-family: kanit;
            color: #fff;
            margin: 0;
            position: relative;
            cursor: default;
        }
        .box {
            align-content: center; text-align: center; padding: 10px; margin: 10px 0; color: #fff;
            background-color: #7c0000; border-radius: 20px; border: 2px #b6b6b6 solid; transition: 0.3s;
            text-decoration: none;
        }
        .box-link:hover {
            cursor: pointer; border: 2px #ff8888 solid; color: #ff8888;
        }
        .flag-container {
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10;
        }
        .flag {
            cursor: pointer;
            margin-left: 5px;
            width: 45px;
            height: 25px;
        }
        .background {
            position: fixed; 
            z-index: -50; 
            height: 100%; 
            width: 100%; 
            top: 0;
            background: linear-gradient(160deg, rgb(197, 0, 0) 0%, rgb(61, 0, 0) 40%, rgb(0, 0, 0) 100%);
        }
    </style>
</head>

<body>
    <div class="background"></div>

    <div class="flag-container">
        <img id="flag" class="flag" onclick="changeLanguage()" src="https://assets.camming.xyz/photos/flags/<?php echo ($lang == 'th') ? 'th' : 'us'; ?>.webp" alt="Flag" />
    </div>

    <div style="margin-top: 100px; display: flex; justify-content: center; align-items: center;">
        <a id="greeting" class="box" style="width: 80%; height: 100px; font-size: 30px;">
            <span><?php echo ($lang == 'th') ? 'Hi! คุณกำลังหาสิ่งใดอยู่งั้นหรอ??' : 'Hi! What are you looking for??'; ?></span>
        </a>
    </div>
    
    <div style="padding: 50px 200px; display: flex; align-items: center; flex-direction: column;">
        <a id="homepage" class="box box-link" href="https://camming.xyz/"><?php echo ($lang == 'th') ? 'กลับไปที่ Homepage' : 'Back to Homepage'; ?></a>
        <a id="gallery" class="box box-link" href="https://assets.camming.xyz/photos/"><?php echo ($lang == 'th') ? 'คลังรูปภาพ' : 'Photo Gallery'; ?></a>
    </div>

    <script>
        function changeLanguage() {
            let currentLanguage = "<?php echo $lang; ?>";
            if (currentLanguage === 'th') {
                document.cookie = "lang=us; path=/";
            } else {
                document.cookie = "lang=th; path=/";
            }
            location.reload();
        }
    </script>

    <noscript>
        <style>
            .popup-noscript {
                position: fixed; top: 0; min-height: 100vh; min-width: 100vw;
                z-index: 100; display: flex; justify-content: center;
                align-items: center; animation: popup-noscript 1s forwards;
            }
            @keyframes popup-noscript {
                0% { backdrop-filter: blur(0px); background-color: #ffffff00; }
                100% { backdrop-filter: blur(3px); background-color: #00000070; }
            }

            .popup-noscript-box {
                max-width: 80vw; background-color: rgba(90, 0, 0, 0.699); animation: popup-noscript-box-show 0.5s forwards;
                border: #af0000 3px solid; border-radius: 20px; padding: 20px;
                font-size: 20px; display: flex; flex-direction: column; align-items: center;
            }
            @keyframes popup-noscript-box-show {
                0% { opacity: 0; transform: scale(0.9); }
                70% { opacity: 1; }
                100% { opacity: 1; transform: scale(1); }
            }

            .popup-noscript-warning {
                border: #ff2121 5px solid; color: #ff2121; border-radius: 50%; height: 50px; width: 50px;
                font-size: 50px; margin: 0px 0px 20px 0px; text-align: center;
                display: flex; align-items: center; justify-content: center;
            }
        </style>
        <div class="popup-noscript">
            <div class="popup-noscript-box">
                <p class="popup-noscript-warning">!</p>
                <p style="margin: 0;">
                    JavaScript ถูกปิดอยู่! กรุณาเปิดใช้งาน JavaScript เพื่อให้เว็บไซต์ทำงานได้อย่างถูกต้อง
                </p>
                <p style="border-bottom: #838383 1px solid; width: 80%; margin: 20px;"></p>
                <p style="margin: 0;">
                    JavaScript is disabled! Please enable JavaScript for this site to work properly
                </p>
            </div>
        </div>
    </noscript>
</body>
</html>
