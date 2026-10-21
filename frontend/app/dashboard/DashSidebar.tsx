'use client';
import { getAvatarURL, getIconURL } from "@/src/utils/getURL";
import { TbArrowBigLeftFilled, TbArrowBigUpLines, TbCrown, TbDiamond, TbHandStop, TbIcons, TbInfoCircle, TbLogout, TbMessage, TbPencil, TbPlus, TbSettings, TbStar, TbStarFilled } from "react-icons/tb";
import { BsStars } from "react-icons/bs";
import { FaBars } from "react-icons/fa6";
import { PiCaretUpDownBold } from "react-icons/pi";
import Link from "next/link";
import { useState, useContext, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GuildContext, UserContext } from "@/src/utils/contexts/Contexts";
import { DashCategoryMenu, DashSidebar as StyleDashSidebar } from "@/src/utils/styles";
import { useGuildList } from "@/src/utils/hooks/useGuildData";

export default function DashSidebar() {
  const { guild } = useContext(GuildContext);
  const { user: profile } = useContext(UserContext);
  const { guilds } = useGuildList();
  const pathname = usePathname();
  const router = useRouter();
  const dashboardType = pathname.startsWith('/dashboard/server') ? 'server'
      : pathname.startsWith('/dashboard/user') ? 'user'
          : null;
  const guildId = (dashboardType === 'server' ? pathname.split('/')[3] : undefined) || guild?.id || '0';
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuActive, setMenuActive] = useState(false);
  const [menuActiveTarget, setMenuActiveTarget] = useState(false);
  const [menuActiveTargetS, setMenuActiveTargetS] = useState('');
  const [menuActivehover, setMenuActivehover] = useState<boolean>(false);
  const [categoryMenu, setCategoryMenu] = useState<boolean[]>([true, true, true]);
  const [changePopup, setChangePopup] = useState<boolean | null>(null);

  interface MenuItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
    tags?: ('beta' | 'premium' | 'new')[];
  }

  interface Category {
    id: string;
    name: string;
    items: MenuItem[];
  }

  const serverMap = (guildId: string): Category[] => [
    {
      id: 'general',
      name: 'General',
      items: [
        { id: 'overview', label: 'Overview', icon: <TbInfoCircle />, path: `/dashboard/server/${guildId}/overview`, tags: ['beta'] },
        { id: 'settings', label: 'Server Settings', icon: <TbSettings />, path: `/dashboard/server/${guildId}/settings` },
        { id: 'premium', label: 'Get Premium', icon: <BsStars />, path: `/dashboard/server/${guildId}/premium`, tags: ['beta', 'premium'] },
        { id: 'upgrade', label: 'Upgrade Bot', icon: <TbArrowBigUpLines />, path: `/dashboard/server/${guildId}/upgrade`, tags: ['beta', 'premium'] },
      ],
    },
    {
      id: 'functionSettings',
      name: 'Function Settings',
      items: [
        { id: 'welcome', label: 'Welcome & Goodbye', icon: <TbHandStop />, path: `/dashboard/server/${guildId}/welcome`, tags: ['beta'] },
        { id: 'send', label: 'Send Message/Embed', icon: <TbMessage />, path: `/dashboard/server/${guildId}/send`, tags: ['beta'] },
      ],
    },
  ];
  const userMap: Category[] = [
    {
      id: 'general',
      name: 'General',
      items: [
        { id: 'overview', label: 'User info', icon: <TbInfoCircle />, path: '/dashboard/user/overview' },
        { id: 'membership', label: 'Membership', icon: <TbDiamond />, path: '/dashboard/user/membership', tags: ['beta', 'premium'] },
        { id: 'premium', label: 'Manage Premium', icon: <BsStars />, path: '/dashboard/user/premium', tags: ['beta', 'premium'] },
      ],
    },
    {
      id: 'other',
      name: 'Other',
      items: [
        { id: 'logout', label: 'Logout', icon: <TbLogout />, path: '/dashboard/user/logout', tags: ['beta'] },
      ],
    },
  ];
  const toggleSideBar = (index: number) => {
      setCategoryMenu((prev) =>
          prev.map((item, i) => (i === index ? !item : item))
      );
  };
  const navigateDashPage = (path: string | undefined) => {
      if (changePopup) {
          const ePage = document.getElementById('page');
          const ePopup = document.getElementById('changePopup');
          if (ePage && ePopup) {
              const ePopup_div = ePopup.querySelector("div");
              if (ePopup_div) {
                  ePopup_div.style.backgroundColor = '#e73737';
                  setTimeout(() => {
                      ePopup_div.style.backgroundColor = '';
                  }, 500);
              };
              ePage.style.position = 'fixed';
              ePage.style.animation = 'shake 0.1s infinite';
              setTimeout(() => {
                  ePage.style.position = 'static';
                  ePage.style.animation = '';
              }, 500);
          };
      } else if (path) {
          router.push(path);
      };
  };
  const updateDataText = () => {
    document.querySelectorAll('[data-text]').forEach((a) => {
      if (a instanceof HTMLElement) {
        const text = a.getAttribute('data-text');
        if (text) {
          a.style.setProperty('--after-content', `"${text}"`);
          a.addEventListener('mouseover', () => {
            a.style.setProperty('--after-opacity', '1');
          });
          a.addEventListener('mouseout', () => {
            a.style.setProperty('--after-opacity', '0');
          });
        }
      };
    });
  };

  useEffect(() => { // MouseEvent
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
          if((menuRef.current && !menuRef.current.contains(event.target as Node)))setMenuActive(false);
      };
  
      document.addEventListener('mousemove', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      
      return () => {
          document.removeEventListener('mousemove', handleClickOutside);
          document.removeEventListener('mousedown', handleClickOutside);
          document.removeEventListener('touchstart', handleClickOutside);
      };
  }, []);
  useEffect(() => {
      if(!menuActive)setMenuActiveTarget(false);
  }, [menuActive]);
  useEffect(() => {
    const category = dashboardType === 'server' ? serverMap(guildId) : userMap;
    setCategoryMenu(m=>m.map((it,i)=>category[i]?.items.some(i=>i.path === pathname) ? true : it));

    document.querySelectorAll('#sub-menu').forEach(subMenu => {
      const color = '#ff47474d';
      const items = Array.from(subMenu.querySelectorAll<HTMLDivElement>('div[id]').values());
      const iFilter = items.filter(e=>e.id === (dashboardType == 'user'
        ? window.location.pathname.split('/')[3] || 'overview'
        : window.location.pathname.split('/')[4] || 'overview'
      ));
      items.forEach(e=>{
        if(iFilter.some(i=>i==e)){e.style.backgroundColor = color}
        else{e.style.backgroundColor = ''};
      });
    });
    document.querySelectorAll('[data-tag]').forEach((a) => {
      if (a instanceof HTMLElement) {
        const tag = a.getAttribute('data-tag');
        const style = `font-size: 10px; margin-left: 5px; padding: 0px 8px; text-align: center; border-radius: 6px; align-content: center; cursor: context-menu; position: relative; width: fit-content;`;
        if (tag == 'new') {
          a.textContent = 'NEW';
          a.style.cssText = `background-color: #11700080; color: #26ff00; border: #26ff00 1px solid; ${style}`;
        } else if (tag == 'update') {
          a.textContent = 'UPDATE';
          a.style.cssText = `background-color: #000f7080; color: #24b2ff; border: #24b2ff 1px solid; ${style}`;
        } else if (tag == 'beta') {
          a.textContent = 'BETA';
          a.style.cssText = `background-color: #5c007080; color: #ec99ff; border: #ec99ff 1px solid; ${style}`;
        } else if (tag == 'unavailable') {
          a.textContent = 'UNAVAILABLE';
          a.style.cssText = `background-color: #b60303; color: #ffffff; border: #ff3131 1px solid; ${style}`;
        } else if (tag == 'premium') {
          a.textContent = 'PREMIUM';
          a.style.cssText = `background-color: #67700080; color: #eeff38; border: #eeff38 1px solid; ${style}`;
        } else if (tag == 'not_support') {
          a.textContent = 'NOT SUPPORT'
          a.style.cssText = `background-color: #b60303; color: #ffffff; border: #ff3131 1px solid; ${style}`;
        };
      };
    });
    updateDataText();
  }, [pathname, dashboardType]);

  return pathname.split('/')[2] !== undefined && (
    <StyleDashSidebar className="dashboard-sidebar">
      {/* <div className={`dashMenuBackDrop ${menuActive} ${menuActive ? 'hover' : ''}`} onClick={() => {setMenuActive(false);setMenuActivehover(false)}} /> */}
      
      <div id="category" style={{ height: 'calc(100vh - 60px)', }} className={`dashCategory ${true ? 'hide' : dashboardType == 'server' ? menuActive ? 'hide' : 'hide' : ''} ${menuActive ? 'overlay' : ''}`} ref={menuRef}>
          <div id="menu" className={`dashMenu ${menuActive ? 'overlay' : ''}`} onMouseEnter={()=>setMenuActivehover(true)} onMouseLeave={()=>setMenuActivehover(false)}><div>
              {/* <div id="back" onClick={() => navigateDashPage(`/dashboard`)} style={{ position: 'fixed', zIndex: 1, cursor: 'pointer', backgroundColor: 'rgba(255, 100, 100)', borderRadius: 5, color: '#fff', textDecoration: 'none', padding: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', width: 'fit-content', }}>
                  <TbArrowBigLeftFilled style={{ marginRight: 5, }} />back
              </div> */}

              <div id="hamburger" onClick={()=>{setMenuActive(!menuActive);setMenuActivehover(false)}}>
                  <div style={{ backgroundColor: `${menuActive ? '#ff47474d' : '#ffffff00'}` }} />
                  <FaBars color="white" size={20} />
              </div>

              <div id="target"><div>
                  <div id="current" onClick={()=>{setMenuActiveTarget(v=>!v)}}>
                      <div>{dashboardType == 'server' ?
                          <>{guild?.icon
                              ? <img src={getIconURL(guild)} />
                              : <div>{guild?.name.slice(0, 1)}</div>}
                          <span translate="no">{guild?.name || 'unknown'}</span></> :
                          <>{profile?.avatar
                              ? <img src={getAvatarURL(profile)} />
                              : <img src='https://cdn.discordapp.com/embed/avatars/0.png' />}
                          <span translate="no">{profile?.global_name || profile?.username || 'unknown'}</span></>
                      }</div>
                      <PiCaretUpDownBold />
                  </div>

                  <div id="all" className={`${menuActiveTarget ? 'show' : 'hide'}`}>
                      <div id='search'><input type="text" placeholder="Search by guild name" onChange={e=>setMenuActiveTargetS(`${e.target.value}`)} /></div>
                      <Link id='user' href='/dashboard/user'><div>
                          {profile?.avatar
                              ? <img src={getAvatarURL(profile)} />
                              : <img src='https://cdn.discordapp.com/embed/avatars/0.png' />}
                          <span translate="no">{profile?.global_name || profile?.username || 'unknown'}</span>
                      </div></Link>
                      <div id="line" style={{ borderBottom: '1px #fff solid', margin: '0px 10% 5px 10%', }} />
                      {guilds?.filter(g=>g.bot_here).filter(g=>g.name.toLocaleLowerCase().includes(menuActiveTargetS.toLocaleLowerCase())).map((g,i)=>{return <Link id='guild' key={g.id} href={`/dashboard/server/${g.id}`}><div>
                          {g.icon
                          ? <img src={getIconURL(g)} />
                          : <div>{g.name.slice(0, 1)}</div>}
                          <span translate="no">{g.name}</span>
                      </div></Link>})}
                  </div>
              </div></div>

              {(() => {
                const categories = dashboardType === 'server' ? serverMap(guildId) : userMap;

                return (
                  <div id="navigate">
                    {categories.map((category, catIndex) => (
                      <DashCategoryMenu key={category.id} id={category.id} $isShow={categoryMenu[catIndex] ?? true} >
                        <div id="sidebar" onClick={() => toggleSideBar(catIndex)}>
                          <div id="arrow">{">"}</div>
                          <div id="name">{category.name}</div>
                        </div>
                        <div id="sub-menu">
                          <div>
                            {category.items.map((item) => (
                              <div key={item.id} id={item.id} onClick={() => { setMenuActivehover(false); navigateDashPage(item.path); }} >
                                {item.icon}
                                {item.label}
                                {item.tags?.map((tag) => (
                                  <div key={tag} data-tag={tag} />
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </DashCategoryMenu>
                    ))}
                  </div>
                );
              })()}
          </div></div>
          <div id="backArrow">
              <div onClick={() => {setMenuActive(!menuActive); setMenuActivehover(false)}} className={`dashMenuArrow ${menuActive} ${menuActive ? 'hover' : ''}`}><TbArrowBigLeftFilled height={40} /></div>
          </div>
      </div>
    </StyleDashSidebar>
  );
}
