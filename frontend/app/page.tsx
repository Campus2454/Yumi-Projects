'use client';

import React, { useEffect, useState } from 'react';
import { HiPencilAlt } from "react-icons/hi";
import { FaCode, FaHome, FaChartLine } from "react-icons/fa";
import { PiLineVerticalBold } from "react-icons/pi";
import { BsLightningChargeFill } from "react-icons/bs";
import { TopBarShortCutLink, BarInfoHomePage, ItemBarInfoHomePage, DevBoxHomePage, HomePage1Button1, HomePage1Button2, ItemBarInfoHomePageDisable, BackgroundFixed, Spinner_lds_ring } from '../src/utils/styles';
import { useRouter } from 'next/navigation';
import { FaBars } from 'react-icons/fa';
import axios from 'axios';
import { User, UserStatus, UserData } from '../src/utils/types';
import moment from 'moment';

export default function HomePage() {
    const router = useRouter();
    const [menuActive, setMenuActive] = useState(false);
    const [windowWidthLimit, setWindowWidthLimit] = useState(false);
    const [devUserInfo, setDevUserInfo] = useState<UserData[]>();
    // const [devUserStatus, setDevUserStatus] = useState<UserStatus[]>();
    const [elapsedTimes, setElapsedTimes] = useState<{ [key: number]: string | undefined }>({});
    const [devStatus, setDevStatus] = useState<{ [key: number]: { status: string, color: string | number } | undefined }>({});
    const [part2selected, setPart2Selected] = useState<number>(0);
    const [mobileMode, setMobileMode] = useState<boolean>();

    const apiDomain = process.env.NEXT_PUBLIC_API_DOMAIN;
    const apiIp = process.env.NEXT_PUBLIC_API_IP_URL;

    const checkMobileMode = () => {
        setMobileMode(window.innerWidth < 1000);
    };

    const calculateTimeElapsed = (start: string | null | undefined) => {
        if (!start) return '';
    
        const duration = moment.duration(moment().diff(moment(start)));
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
    
        let elapsedTime = '';
        if (days > 0) elapsedTime += `${days}d `;
        if (hours > 0) elapsedTime += `${hours}h `;
        if (minutes > 0) elapsedTime += `${minutes}m`;
    
        return elapsedTime.trim();
    };

    useEffect(() => {
        checkMobileMode();
        
        const handleResize = () => {
            setWindowWidthLimit(window.screen.width <= 1000);
            console.log('windowWidthLimit: '+windowWidthLimit);
        };

        // Promise.all([
        //     axios.get('https://api.yumistack.net/discord/user/879724821662015499/status'),
        //     axios.get('https://api.yumistack.net/discord/user/612581588370325529/status'),
        //     axios.get('https://api.yumistack.net/discord/user/848642888115552298/status')
        // ])
        // .then((responses) => {
        //     const combinedData = responses.map(response => response.data);
        //     setDevUserStatus(combinedData);
        // })
        // .catch((error) => {
        //     console.error("Error fetching data:", error);
        // });

        const DevData = () => {
            if(window.location.hostname == process.env.NEXT_PUBLIC_HOSTNAME){
                Promise.all([
                    axios.get(`${apiDomain}/discord/user/879724821662015499`),
                    axios.get(`${apiDomain}/discord/user/612581588370325529`),
                    axios.get(`${apiDomain}/discord/user/848642888115552298`)
                ]).then((responses) => {
                    const combinedData = responses.map(response => response.data);
                    setDevUserInfo(combinedData);
                }).catch((error) => {
                    console.error("Error fetching data:", error);
                })
            }else if(window.location.hostname != process.env.NEXT_PUBLIC_HOSTNAME){
                Promise.all([
                    axios.get(`${apiIp}/discord/user/879724821662015499`),
                    axios.get(`${apiIp}/discord/user/612581588370325529`),
                    axios.get(`${apiIp}/discord/user/848642888115552298`)
                ]).then((responses) => {
                    const combinedData = responses.map(response => response.data);
                    setDevUserInfo(combinedData);
                }).catch((error) => {
                    console.error("Error fetching data:", error);
                })
            }
        };DevData();const intervalDevData = setInterval(DevData, 60_000);clearInterval(intervalDevData);

        async function statistics() {
            if(window.location.hostname == process.env.NEXT_PUBLIC_HOSTNAME){
                const res = await fetch(`${apiDomain}/discord/statistics`);
                if(res.ok){
                    const json: {guilds: string, members: string} = await res.json();
                    const elServer = document.getElementById('statistics-servers');
                    if(elServer && json.guilds){
                        elServer.textContent = json.guilds;
                    };
                    const elMember = document.getElementById('statistics-members');
                    if(elMember && json.members){
                        elMember.textContent = json.members;
                    };
                }
            }else{
                const res = await fetch(`${apiIp}/discord/statistics`);
                if(res.ok){
                    const json: {guilds: string, members: string} = await res.json();
                    const elServer = document.getElementById('statistics-servers');
                    if(elServer && json.guilds){
                        elServer.textContent = json.guilds;
                    };
                    const elMember = document.getElementById('statistics-members');
                    if(elMember && json.members){
                        elMember.textContent = json.members;
                    };
                }
            };
        };statistics();
    }, []);

    useEffect(() => {
        checkMobileMode();
    }, []);

    useEffect(() => {
        const userData = () => {
            const newElapsedTimes: { [key: number]: string | undefined } = {};
            const newStatus: { [key: number]: { status: string, color: string | number } | undefined } = {};
            console.log(devUserInfo);
            devUserInfo?.forEach((user, index) => {
                if(user.activities?.[0]?.timestamps?.start){
                    newElapsedTimes[index] = calculateTimeElapsed(user.activities[0].timestamps.start);
                }else{ newElapsedTimes[index] = undefined };
                if(user.status){
                    newStatus[index] = {
                        status: user.status,
                        color: user.status === "online" ? "#0dce8e" : user.status === "dnd" ? "#ff7060" : user.status === "idle" ? "#f0980a" : "#9ca3af"
                    };
                };
            });
            setElapsedTimes(newElapsedTimes);
            setDevStatus(newStatus);
            // console.log(elapsedTimes);
            // console.log(devStatus);
        };
        userData();
        const interval = setInterval(userData, 60_000);
        return () => clearInterval(interval);
    }, [devUserInfo]);

    useEffect(() => {
        const part2Element = document.getElementById("part2");
        const items = part2Element?.querySelectorAll(".fade-up");
      
        items?.forEach((item) => {
          item.classList.remove("show");
          item.classList.add("hide");
        });
      
        if (part2selected !== undefined) {
          const activeItem = part2Element?.querySelector(`#${['statistics', 'developers', 'status'][part2selected]}`);
          if (activeItem) {
            activeItem.classList.remove("hide");
            activeItem.classList.add("show");
          }
        }
    }, [part2selected]);

    const toggleMenu = () => {
        setMenuActive(!menuActive);
    };

    const activitiesTimestamps = (time: string) => {
        
    }

    const handlePart2Select = (index: number) => {
        setPart2Selected(index);
    };
    

//   window.onresize = handleResize();

  return (
    <div className="page">
        {/* Background Fixed*/}
        <BackgroundFixed id="background"/>

        {/* Part1 */}
        <div id="part1" className="homePage1"  style={{ marginTop: 0, }}>
            <div className="homePage1-2">
                <div style={{ justifyItems: "baseline" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                        <h1 style={{ fontSize: 30, margin: 0 }}>Multipurpose bot</h1>
                        <h2 style={{ fontSize: 70, margin: 0, color: "rgb(255 80 80)", WebkitTextStroke: 1,  WebkitTextFillColor: "transparent" }}>
                            YUMI
                        </h2>
                    </div>
                    <p>Make your server perfect and secure by inviting this bot</p>
                    <div style={{ display: "flex", marginTop: 20, gap: 20 }}>
                        <a href="/invite" target="_blank">
                            <HomePage1Button1>Invite</HomePage1Button1>
                        </a>
                        <a href="/discord" target="_blank">
                            <HomePage1Button2>Join Server</HomePage1Button2>
                        </a>
                    </div>
                </div>
                <img
                    src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/photos/logo/yumi/001.webp`}
                    alt="Yumi Icon"
                    style={{ height: 300, borderRadius: '50%' }}
                />
            </div>
        </div>

        {/* Part2 */}
        <div id="part2" style={{ minHeight: "70vh", }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 100, paddingBottom: 100, flexDirection: "column", }}>
                <BarInfoHomePage>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", minWidth: "80%", }}>
                        <ItemBarInfoHomePage $isSelect={part2selected === 0 ? true : false} onClick={()=>handlePart2Select(0)}>
                            <FaChartLine />
                            <span style={{ background: "none", border: "none", font: "14px Kanit", }}>Statistics</span>
                        </ItemBarInfoHomePage>
                        <PiLineVerticalBold />
                        <ItemBarInfoHomePage $isSelect={part2selected === 1 ? true : false} onClick={()=>handlePart2Select(1)}>
                        <FaCode style={{ width: 15, height: 15, }} />
                            <span style={{ background: "none", border: "none", font: "14px Kanit", }}>Developers</span>
                        </ItemBarInfoHomePage>
                        <PiLineVerticalBold />
                        <ItemBarInfoHomePage $isSelect={part2selected === 2 ? true : false} onClick={()=>handlePart2Select(2)}>
                            <BsLightningChargeFill />
                            <span style={{ background: "none", border: "none", font: "14px Kanit", }}>Status</span>
                        </ItemBarInfoHomePage>
                        <PiLineVerticalBold />
                        <ItemBarInfoHomePageDisable $isSelect={part2selected === 3 ? true : false}>
                            <HiPencilAlt style={{ width: 15, height: 15, }} />
                            <span style={{ background: "none", border: "none", font: "14px Kanit", }}>Change Log</span>
                        </ItemBarInfoHomePageDisable>
                    </div>
                </BarInfoHomePage>
                <div style={{ height: "20px", }}/>

                <div className="fade-up" id="statistics" style={{ display: "flex", position: part2selected === 0 ? "static" : "fixed", flexDirection: "row", flexWrap: "wrap", justifyContent: "center", textAlign: "center", }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", backgroundColor: "#d23030", width: 220, height: 220, borderRadius: 10, margin: "10px", }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 512 512"><path fill="#ffffff" d="M64 32C28.7 32 0 60.7 0 96l0 64c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 32zm280 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm48 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0zM64 288c-35.3 0-64 28.7-64 64l0 64c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-64c0-35.3-28.7-64-64-64L64 288zm280 72a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm56 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/></svg>
                        <h2 id="statistics-servers" style={{ margin: 0, }}>0</h2>
                        <span style={{ fontSize: 15, margin: 0, }}>Servers</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", backgroundColor: "#d23030", width: 220, height: 220, borderRadius: 10, margin: "10px", }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 0 640 512"><path fill="#ffffff" d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"/></svg>
                        <h2 id="statistics-members" style={{ margin: 0, }}>0</h2>
                        <span style={{ fontSize: 15, margin: 0, }}>Members</span>
                    </div>
                </div>

                <div className="fade-up" id="developers" style={{ display: "flex", position: part2selected === 1 ? "static" : "fixed", flexDirection: "column", flexWrap: "wrap", justifyContent: "flex-start", alignContent: "flex-start", alignItems: "flex-start", textAlign: "center", width: "100%", }}>
                    <div style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", justifyContent: "flex-start", alignContent: "flex-start", alignItems: "flex-start", textAlign: "center", margin: "0 3%", }}>
                        <span style={{ fontSize: 50, margin: 0, }}>Developers</span>
                        <span style={{ fontSize: 15, margin: 0, paddingBottom: 10, }}>This is our developer</span>
                        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", alignContent: "flex-start", alignItems: "flex-start", textAlign: "center", }}>
                            {devUserInfo ? devUserInfo.map((user, index) => (
                                <DevBoxHomePage key={index}>
                                    <p style={{ backgroundImage: `linear-gradient(180deg, rgb(0 0 0 / 100%) 0%, rgb(0 0 0 / 50%) 30%, rgb(0 0 0 / 0%) 60%, rgb(0 0 0 / 0%) 100%), url(https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=1024)` }} />
                                    <div>
                                        <span style={{ fontSize: 22, margin: 0 }}>{user.global_name || user.username || 'Unknown'}</span>
                                        <span style={{ fontSize: 12, margin: 0, color: "#dedede" }}>{user.username}</span>
                                        <span style={{ fontSize: 15, margin: 0, color: `${devStatus[index]?.color || "#9ca3af"}` }}>
                                            {
                                                devStatus[index]?.status === "online" ? "Online" :
                                                devStatus[index]?.status === "dnd" ? "Do Not Disturb" :
                                                devStatus[index]?.status === "idle" ? "Idle" : "Offline"
                                            }
                                        </span>
                                        <span style={{ fontSize: 14, margin: 0 }}>
                                            {(() => {
                                                if(index === 0)return "Bot Developer, Web Developer";
                                                else if(index === 1)return "Web Developer";
                                                else if(index === 2)return "";
                                                else return "";
                                            })()}
                                        </span>
                                    </div>
                                    {user.activities?.[0] ? user.activities?.[0].type == 0 ? (
                                        <div style={{ fontSize: 15, backgroundColor: "#000000bf", borderRadius: "0 12px 12px 0", padding: "5px 15px 5px 10px", margin: "0 0 10px 0", flexDirection: "row", alignItems: "flex-end" }}>
                                            <img src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/photos/icons/gaming-pad.webp`} style={{ height: 20, marginRight: 5 }} />
                                            {`${user.activities[0].name}`}
                                            <span style={{ color: '#b0b0b0', fontSize: '85%', marginLeft: '5px' }}>
                                                {elapsedTimes[index] || calculateTimeElapsed(user.activities[0].timestamps?.start)}
                                            </span>
                                        </div>
                                    ) : user.activities?.[0].type == 4 ? (
                                        <div style={{ fontSize: 15, backgroundColor: "#000000bf", borderRadius: "0 12px 12px 0", padding: "5px 15px 5px 10px", margin: "0 0 10px 0", flexDirection: "row", alignItems: "center", maxWidth: "80%", whiteSpace: "nowrap", overflow: "hidden", position: "relative", }}>
                                            <div style={{ boxShadow: 'inset -5px 0px 20px 0px #000', left: 0, height: "100%", width: "100%", borderRadius: "0px 12px 12px 0px", position: "absolute", }}/>
                                            {user.activities[0].emoji?.imageURL ?
                                                <img src={user.activities[0].emoji.imageURL} alt={user.activities[0].emoji.name || 'emoji'} width={20} style={{ marginRight: 5, }} /> :
                                                user.activities[0].emoji?.name ? <span style={{ marginRight: 5, }}>{user.activities[0].emoji?.name}</span> : ''
                                            }
                                            {`${user.activities[0].state != null ? user.activities[0].state : ''}`}
                                        </div>
                                    ) : <div /> : <div />}
                                </DevBoxHomePage>
                            )) : <DevBoxHomePage><span style={{ fontSize: 20, alignContent: 'center', height: '100%' }}>Unable to connect to database.</span></DevBoxHomePage>}
                        </div>
                    </div>
                </div>

                <div className="fade-up" id="status" style={{ display: "flex", position: part2selected === 2 ? "static" : "fixed", flexDirection: "column", flexWrap: "wrap", justifyContent: "center", alignContent: "center", alignItems: "center", width: "100%", }}>
                    <iframe src="https://status.yumistack.net/iframe?range=30d" style={{ width: "80%", height: "520px", border: "10px solid #0f0f0f", borderRadius: 20, boxShadow: '0 0 20px 2px #000', background: "transparent" }} title="Yumi Status" loading="lazy"/>
                </div>
            </div>
        </div>
        
        {/* end */}
        <div id="end">{mobileMode ? <div></div> : (
            <div id='end-footer' style={{ position: 'absolute', width: '100%', display: "flex", justifyContent: "center", flexDirection: 'column', alignItems: 'center', }}>
                <img style={{ position: 'relative', zIndex: 5, maskImage: 'linear-gradient(to top, rgb(0 0 0), rgb(0 0 0), rgb(0 0 0 / 75%), rgb(0 0 0 / 25%), rgb(255 255 255 / 0%))' }} src={`${process.env.NEXT_PUBLIC_ASSETS_DOMAIN}/photos/logo/yumi/banner_yumi_02.jpg`}/>
                
                <div style={{ position: 'absolute', display: "flex", alignItems: "center", justifyContent: "space-between", width: "85%", bottom: 20, zIndex: 10, color: '#ffffff', textShadow: '0px 0px 10px #000000', boxShadow: '0 0 20px 2px #000', borderRadius: '10px', padding: '5px 20px', }}>
                    <div>
                        © 2024-2026 Yumi All Rights Reserved.
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "25%", }}>
                        <a href="/privacy-policy" target="_top">Privacy Policy</a>
                        <div style={{ cursor: "no-drop", }}>Terms &amp; Conditions</div>
                    </div>
                </div>
            </div>
        )}</div>
    </div>
  );
};
