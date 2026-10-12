<?php
    if (isset($_COOKIE['lang'])) {
        $lang = $_COOKIE['lang'];
    } else {
        $lang = 'th';
    }
?>

<!DOCTYPE html>
<html lang="<?php echo $lang; ?>">
<head>
    <meta charset="UTF-8">
    <link rel="icon" href="/CammingBOT AssetLogo.webp">
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
        .box-img {
            display: flex; flex-direction: column; margin: 5px; align-items: center;
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
            <span>
                <?php echo ($lang == 'th') ? 'Hi! คุณกำลังหาสิ่งใดอยู่งั้นหรอ??' : 'Hi! What are you looking for??'; ?>
            </span>
        </a>
    </div>
    
    <div style="padding: 50px 200px; display: flex; align-items: center; flex-direction: column;">
        <div style="padding: 10px; margin: 10px 0;">
            <?php
            $path = preg_replace('#([^/])$#', '$1/', $_GET['path']);
            $folders = glob("$path*", GLOB_ONLYDIR);
            foreach ($folders as $folder) {
                $folderName = basename($folder);
                echo '<a class="box box-link" href="https://assets.camming.xyz/photos/' . $folderName . '">' . $folderName . '</a>';
            }
            ?>
        </div>
        <div style="padding: 10px; margin: 10px 0; display: flex; justify-content: space-evenly; width: 100%; flex-direction: row; flex-wrap: wrap;">
            <?php
            $path = preg_replace('#([^/])$#', '$1/', $_GET['path']);
            $images = glob("$path*.{jpg,jpeg,png,gif,webp}", GLOB_BRACE); // Add webp here
            foreach ($images as $image) {
                $imageName = basename($image);
                echo '<a class="box box-link box-img" href="' . $image . '" target="_blank">';
                echo '<img src="' . $image . '" alt="' . $imageName . '" height="100px">';
                echo $imageName;
                echo '</a>';
            }
            $svgFile = glob("$path*.svg", GLOB_BRACE);
            foreach ($svgFile as $svg) {
                $svgName = basename($svg);
                echo '<a class="box box-link box-img" href="' . $svg . '" target="_blank">';
                echo '<object type="image/svg+xml" data="' . $svg . '" style="height: 100px">' . $svgName . '</object>';
                echo $svgName;
                echo '</a>';
            }
            ?>
        </div>
        <a id="back" class="box box-link" onClick={goBack()}>
            <?php echo ($lang == 'th') ? 'ย้อนกลับ' : 'Back'; ?>
        </a>
    </div>

    <script>
        function changeLanguage() {
            const greetingElement = document.getElementById("greeting");
            const backElement = document.getElementById("back");
            const flagElement = document.getElementById("flag");

            if (document.cookie.indexOf("lang=en") >= 0) {
                greetingElement.textContent = "Hi! คุณกำลังหาสิ่งใดอยู่งั้นหรอ??";
                backElement.textContent = "ย้อนกลับ";
                flagElement.src = "https://assets.camming.xyz/photos/flags/th.webp";
                document.cookie = "lang=th; path=/";
            } else {
                greetingElement.textContent = "Hi! What are you looking for??";
                backElement.textContent = "Back";
                flagElement.src = "https://assets.camming.xyz/photos/flags/us.webp";
                document.cookie = "lang=en; path=/";
            }
            location.reload();
        }

        function goBack() {
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/').filter(part => part);
            if (pathParts.length > 1) {
                pathParts.pop();
                const newPath = '/' + pathParts.join('/');
                window.location.href = newPath || '/';
            } else {
                window.location.href = '/';
            }
        }

        if (window.location.pathname !== '/photos/' && window.location.pathname.endsWith('/')) {
            window.location.href = window.location.pathname.slice(0, -1) + window.location.search + window.location.hash;
        }
        
    </script>
</body>

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

</html>
