'use client';

import React, { useState } from 'react';
import { BackgroundFixed } from '../../src/utils/styles';
import { 
    FaShieldAlt, 
    FaDatabase, 
    FaUserCheck, 
    FaTrashAlt, 
    FaLock, 
    FaGlobeAmericas, 
    FaHeadset, 
    FaCheckCircle, 
    FaExclamationTriangle,
    FaServer,
    FaComments,
    FaUserFriends
} from 'react-icons/fa';
import styled from 'styled-components';

const PolicyContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 80px;
    min-height: 100vh;
`;

const ContentWrapper = styled.div`
    margin: 20px 10px;
    margin-top: 40px;
    width: 90%;
    max-width: 1050px;
`;

const HeroCard = styled.div`
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(210, 48, 48, 0.4) 0%, rgba(45, 12, 12, 0.8) 50%, rgba(20, 20, 20, 0.95) 100%);
    border: 1px solid rgba(255, 90, 90, 0.35);
    border-radius: 20px;
    padding: 45px 35px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(255, 80, 80, 0.1);
    backdrop-filter: blur(10px);
    margin-bottom: 30px;
    text-align: center;

    &::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 80, 80, 0.12) 0%, transparent 70%);
        pointer-events: none;
    }
`;

const HeroTitle = styled.h1`
    font-size: 42px;
    font-weight: 900;
    margin: 0;
    letter-spacing: 1px;
    background: linear-gradient(90deg, #ffffff 0%, #ff8c8c 50%, #ff4d4d 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    @media (max-width: 768px) {
        font-size: 30px;
    }
`;

const HeroSubtitle = styled.p`
    font-size: 16px;
    color: #dedede;
    margin-top: 12px;
    margin-bottom: 20px;
`;

const LangSwitchGroup = styled.div`
    display: inline-flex;
    background: rgba(0, 0, 0, 0.6);
    padding: 5px;
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

const LangOption = styled.button<{ $active: boolean }>`
    background: ${props => props.$active ? 'linear-gradient(135deg, #f13b3b 0%, #a81c1c 100%)' : 'transparent'};
    color: ${props => props.$active ? '#ffffff' : '#ababab'};
    font-family: 'Kanit', sans-serif;
    font-size: 14px;
    font-weight: ${props => props.$active ? '600' : '400'};
    padding: 8px 22px;
    border-radius: 25px;
    cursor: pointer;
    border: none;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
        color: #ffffff;
    }
`;

const FeatureGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
`;

const InfoCard = styled.div`
    background: #252424bf;
    border: 1px solid #4a4a4a;
    border-radius: 16px;
    padding: 26px 24px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(6px);
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;

    &:hover {
        transform: translateY(-4px);
        border-color: rgba(255, 90, 90, 0.5);
        box-shadow: 0 12px 28px rgba(210, 48, 48, 0.15);
    }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
`;

const IconCircle = styled.div<{ $color?: string }>`
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${props => props.$color || 'linear-gradient(135deg, #d23030 0%, #6e1111 100%)'};
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: #ffffff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    flex-shrink: 0;
`;

const CardTitle = styled.h3`
    font-size: 19px;
    font-weight: 600;
    color: #ffffff;
    margin: 0;
`;

const CardBody = styled.div`
    font-size: 14.5px;
    color: #c9c9c9;
    line-height: 1.65;
    flex-grow: 1;

    ul {
        list-style: none;
        padding-left: 0;
        margin-top: 10px;
    }

    li {
        position: relative;
        padding-left: 20px;
        margin-bottom: 8px;

        &::before {
            content: '•';
            position: absolute;
            left: 5px;
            color: #ff5e5e;
            font-size: 18px;
            line-height: 1;
        }
    }
`;

const NoticeBanner = styled.div`
    background: linear-gradient(90deg, rgba(210, 48, 48, 0.25) 0%, rgba(40, 20, 20, 0.6) 100%);
    border-left: 5px solid #ff4242;
    border-radius: 10px;
    padding: 18px 22px;
    margin-bottom: 25px;
    display: flex;
    align-items: flex-start;
    gap: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

    svg {
        font-size: 22px;
        color: #ff5e5e;
        flex-shrink: 0;
        margin-top: 3px;
    }

    p {
        margin: 0;
        font-size: 14.5px;
        color: #f7d5d5;
        line-height: 1.6;
    }
`;

const ContactBox = styled.div`
    background: linear-gradient(135deg, #1e1e1e 0%, #291818 100%);
    border: 1px solid #4a4a4a;
    border-radius: 16px;
    padding: 30px;
    text-align: center;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    margin-top: 10px;

    h4 {
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 10px;
        color: #fff;
    }

    p {
        font-size: 14px;
        color: #ababab;
        margin-bottom: 20px;
    }
`;

const ContactLinks = styled.div`
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
`;

const ActionButton = styled.a`
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #d23030 0%, #8f1717 100%);
    color: #ffffff;
    text-decoration: none;
    font-size: 15px;
    font-weight: 500;
    padding: 10px 24px;
    border-radius: 8px;
    border: 1px solid #ff6666;
    box-shadow: 0 4px 12px rgba(210, 48, 48, 0.3);
    transition: all 0.25s ease;

    &:hover {
        background: linear-gradient(135deg, #ff4747 0%, #b31f1f 100%);
        transform: scale(1.04);
        box-shadow: 0 6px 16px rgba(255, 70, 70, 0.4);
    }
`;

export default function PrivacyPolicyPage() {
    const [lang, setLang] = useState<'th' | 'en'>('th');

    return (
        <div className="page">
            <BackgroundFixed id="background" />

            <PolicyContainer>
                <ContentWrapper>
                    
                    {/* Hero Header */}
                    <HeroCard>
                        <HeroTitle>
                            {lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
                        </HeroTitle>
                        <HeroSubtitle>
                            {lang === 'th' 
                                ? 'ข้อกำหนดในการคุ้มครองและดูแลข้อมูลสำหรับผู้ใช้งาน Yumi Discord Bot' 
                                : 'Terms of data protection and privacy standards for Yumi Discord Bot'}
                        </HeroSubtitle>

                        {/* Language Selector */}
                        <LangSwitchGroup>
                            <LangOption $active={lang === 'th'} onClick={() => setLang('th')}>
                                <FaGlobeAmericas /> ภาษาไทย
                            </LangOption>
                            <LangOption $active={lang === 'en'} onClick={() => setLang('en')}>
                                <FaGlobeAmericas /> English
                            </LangOption>
                        </LangSwitchGroup>
                    </HeroCard>

                    {/* Notice Banner */}
                    <NoticeBanner>
                        <FaExclamationTriangle />
                        <div>
                            <p>
                                {lang === 'th' 
                                    ? 'บอท Yumi ให้ความสำคัญสูงสุดกับความปลอดภัยและความเป็นส่วนตัวของคุณ เราไม่มีการจัดเก็บข้อความสนทนาทั่วไป หรือข้อมูลส่วนตัวที่ละเอียดอ่อน (Sensitive Data) อย่างถาวรในฐานข้อมูล' 
                                    : 'Yumi Bot places the highest priority on your privacy. We strictly do NOT store general chat message histories, private conversation contents, or sensitive financial information permanently.'}
                            </p>
                        </div>
                    </NoticeBanner>

                    {/* Policy Content in Interactive Grid */}
                    {lang === 'th' ? (
                        <>
                            <FeatureGrid>
                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle>
                                            <FaServer />
                                        </IconCircle>
                                        <CardTitle>1. ข้อมูลการตั้งค่าเซิร์ฟเวอร์</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        เรารวบรวมข้อมูลการตั้งค่าเพื่อให้ฟังก์ชันของบอททำงานได้อย่างถูกต้องตามที่แอดมินกำหนด:
                                        <ul>
                                            <li><strong>Guild ID & Channel ID:</strong> สำหรับระบุเซิร์ฟเวอร์และช่องส่งข้อความ/Audit Log</li>
                                            <li><strong>Prefix & Welcome Config:</strong> คำนำหน้าคำสั่งดั้งเดิม และเทมเพลตข้อความต้อนรับ/อำลา</li>
                                            <li><strong>Audit Log Rules:</strong> ช่องทางที่เลือกให้บันทึกเหตุการณ์ต่างๆ ของเซิร์ฟเวอร์</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #e65c00 0%, #F9D423 100%)">
                                            <FaUserFriends />
                                        </IconCircle>
                                        <CardTitle>2. ข้อมูลสมาชิก & บทบาท</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        ประมวลผลข้อมูลสมาชิกเพื่อตอบสนองต่อคำสั่งดูแลและจัดการ:
                                        <ul>
                                            <li><strong>User ID & Username:</strong> ระบุผู้ใช้สำหรับคำสั่งจัดการบทบาท (/role), เตะ/แบน (/kick, /ban), และตั้งเวลาพักการใช้งาน (/timeout)</li>
                                            <li><strong>Role ID:</strong> มอบหมายหรือถอดถอนยศตามคำสั่งแบบเดี่ยวหรือกลุ่ม (/role multiple)</li>
                                            <li><strong>Dynamic Mention:</strong> แทรกชื่อและแท็กในข้อความต้อนรับ ({'{userTag}'}, {'{memberCount}'})</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
                                            <FaComments />
                                        </IconCircle>
                                        <CardTitle>3. การประมวลผลข้อความ</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        การเข้าถึงเนื้อหาข้อความ (Message Content) เกิดขึ้นแบบชั่วคราว (Ephemeral Memory) เท่านั้น:
                                        <ul>
                                            <li>ตรวจสอบคำสั่ง Prefix แบบดั้งเดิม เช่น !prefix หรือ !ping</li>
                                            <li>กรองข้อความเพื่อลบตามจำนวนและสมาชิกที่ระบุในคำสั่ง /clear</li>
                                            <li>ส่งการแจ้งเตือน Audit Log เมื่อมีข้อความถูกแก้ไขหรือถูกลบในเซิร์ฟเวอร์</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #8A2387 0%, #E94057 100%)">
                                            <FaTrashAlt />
                                        </IconCircle>
                                        <CardTitle>4. การลบข้อมูล (Data Retention)</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <ul>
                                            <li>ข้อมูลการตั้งค่าทั้งหมดจะคงอยู่ตราบเท่าที่บอท Yumi ยังอยู่ในเซิร์ฟเวอร์ของคุณ</li>
                                            <li>เมื่อบอทถูกเตะหรือนำออกจากเซิร์ฟเวอร์ (Bot Removed/Kicked) การตั้งค่าทั้งหมดจะถูกลบออกจากฐานข้อมูลทันที</li>
                                            <li>ผู้ดูแลเซิร์ฟเวอร์สามารถติดต่อขอลบข้อมูลทั้งหมดได้ตลอดเวลาผ่าน Support Server</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)">
                                            <FaLock />
                                        </IconCircle>
                                        <CardTitle>5. การปกป้อง & การเปิดเผยข้อมูล</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <ul>
                                            <li>เราไม่เคยและจะไม่มีการขาย โอนถ่าย หรือแบ่งปันข้อมูลของผู้ใช้แก่บุคคลภายนอก</li>
                                            <li>ข้อมูลการเชื่อมต่อถูกเข้ารหัสและปกป้องตามมาตรฐานความปลอดภัย</li>
                                            <li>การประมวลผลทั้งหมดเป็นไปตามข้อกำหนด Discord Developer Terms of Service</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #0052D4 0%, #4364F7 100%)">
                                            <FaHeadset />
                                        </IconCircle>
                                        <CardTitle>6. การพัฒนาและการอัปเดต</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <ul>
                                            <li>นโยบายนี้อาจได้รับการปรับปรุงให้สอดคล้องกับฟีเจอร์ใหม่และกฎระเบียบของ Discord</li>
                                            <li>การเปลี่ยนแปลงที่สำคัญจะได้รับการแจ้งเตือนผ่านหน้าเว็บไซต์หรือช่องประกาศ</li>
                                            <li>อัปเดตล่าสุด: 31 สิงหาคม 2026</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>
                            </FeatureGrid>
                        </>
                    ) : (
                        <>
                            <FeatureGrid>
                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle>
                                            <FaServer />
                                        </IconCircle>
                                        <CardTitle>1. Server Configurations</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        We collect server configuration attributes strictly to execute administrator settings:
                                        <ul>
                                            <li><strong>Guild & Channel IDs:</strong> Essential for routing bot notifications, welcome greetings, and audit log channels.</li>
                                            <li><strong>Prefix & Welcome Settings:</strong> Stored custom prefix and greeting template formatting.</li>
                                            <li><strong>Audit Log Rules:</strong> Guild-specific event routing configurations.</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #e65c00 0%, #F9D423 100%)">
                                            <FaUserFriends />
                                        </IconCircle>
                                        <CardTitle>2. Member & Role Information</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        We process member metadata solely to execute moderation and management requests:
                                        <ul>
                                            <li><strong>User ID & Username:</strong> Used for target resolution in /role, /ban, /kick, /unban, and /timeout commands.</li>
                                            <li><strong>Role ID:</strong> Utilized for granular and batch role modifications (/role multiple).</li>
                                            <li><strong>Template Substitutions:</strong> Dynamic placeholders ({'{userTag}'}, {'{memberCount}'}) in greeting messages.</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)">
                                            <FaComments />
                                        </IconCircle>
                                        <CardTitle>3. Message Content Handling</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        Message content access is transient and processed purely in real-time RAM:
                                        <ul>
                                            <li>Execution of legacy text-based prefix commands (!prefix, !ping).</li>
                                            <li>Safe message purging and member filtering via the /clear command.</li>
                                            <li>Real-time message edit and delete dispatching for audit logging channels.</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #8A2387 0%, #E94057 100%)">
                                            <FaTrashAlt />
                                        </IconCircle>
                                        <CardTitle>4. Data Retention & Deletion</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <ul>
                                            <li>Configurations persist solely as long as Yumi remains an active member of your server.</li>
                                            <li>When Yumi is kicked or removed from a guild, all associated guild configuration records are permanently purged immediately.</li>
                                            <li>Server owners can request complete manual data erasure at any time.</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #4A00E0 0%, #8E2DE2 100%)">
                                            <FaLock />
                                        </IconCircle>
                                        <CardTitle>5. Security & Third-Party Policy</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <ul>
                                            <li>We NEVER sell, trade, or share user or guild data with any third-party entity.</li>
                                            <li>All communications and database transactions use industry-standard encryption.</li>
                                            <li>Strict compliance with Discord Developer Terms of Service and Developer Policy.</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>

                                <InfoCard>
                                    <CardHeader>
                                        <IconCircle $color="linear-gradient(135deg, #0052D4 0%, #4364F7 100%)">
                                            <FaHeadset />
                                        </IconCircle>
                                        <CardTitle>6. Updates & Inquiries</CardTitle>
                                    </CardHeader>
                                    <CardBody>
                                        <ul>
                                            <li>This policy may be revised periodically to reflect new features or Discord requirements.</li>
                                            <li>Significant revisions will be announced on our official support channels.</li>
                                            <li>Last Revised: August 31, 2026</li>
                                        </ul>
                                    </CardBody>
                                </InfoCard>
                            </FeatureGrid>
                        </>
                    )}

                    {/* Contact & Support Section */}
                    <ContactBox>
                        <h4>{lang === 'th' ? 'ต้องการความช่วยเหลือหรือมีคำถาม?' : 'Questions or Data Removal Inquiries?'}</h4>
                        <p>
                            {lang === 'th' 
                                ? 'คุณสามารถติดต่อทีมงานผู้พัฒนา Yumi ได้ตลอด 24 ชั่วโมงผ่านช่องทางด้านล่าง' 
                                : 'You can reach out directly to the Yumi development and support team anytime.'}
                        </p>
                        <ContactLinks>
                            <ActionButton href="https://discord.gg/brxPZB3Jzy" target="_blank" rel="noreferrer">
                                <FaHeadset /> Discord Support Server
                            </ActionButton>
                            <ActionButton href={`${process.env.NEXT_PUBLIC_DOMAIN}/invite`} target="_blank" rel="noreferrer">
                                <FaServer /> Invite Yumi
                            </ActionButton>
                        </ContactLinks>
                    </ContactBox>

                </ContentWrapper>
            </PolicyContainer>
        </div>
    );
};
