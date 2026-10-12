import axios from 'axios';
import dotenv from 'dotenv';
import chalk from 'chalk';

dotenv.config();

const API_KEY = process.env.YOUTUBE_API_KEY;
const channelId = 'UCzEtQm1IL_5J2gVF-qWptfQ';

class YouTubeNotifier {
    private channelId: string;

    constructor(channelId: string) {
        this.channelId = channelId;
    }

    async getLatestVideos() {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${this.channelId}&part=snippet,id&order=date&maxResults=5`;
        try {
            const response = await axios.get(url);
            return response.data.items;
        } catch (error) {
            console.error('Error fetching videos:', error);
            throw error;
        }
    }
}

const notifier = new YouTubeNotifier(channelId);

async function checkForNewVideos() {
    const latestVideos = await notifier.getLatestVideos();
    if (latestVideos.length > 0) {
        const latestVideo = latestVideos[0];
        console.log('New video detected:', latestVideo.snippet.title, chalk.yellow(new Date()));
        // ที่นี่คุณสามารถเพิ่มการแจ้งเตือน เช่น ส่งข้อความไปยัง Discord
    } else {
        console.log('No new videos found.');
    }
}

checkForNewVideos()
// ตั้งเวลาให้ตรวจสอบทุก 1 นาที
setInterval(checkForNewVideos, 60_000);