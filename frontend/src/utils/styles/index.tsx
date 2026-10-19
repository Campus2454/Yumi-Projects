'use client';

import Link from "next/link";
import styled, { css } from "styled-components";

export const BackgroundFixed = styled.div`
  position: fixed;
  z-index: -50;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(160deg, rgb(197, 0, 0) 0%, rgb(61, 0, 0) 40%, rgb(0, 0, 0) 100%);
  background: #363535ff;
  background: #343333ff;
`;

export const UserMenuItem = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  // background: linear-gradient(160deg, rgb(158, 0, 0) 0%, rgb(61, 0, 0) 40%, rgb(0, 0, 0) 100%);
  background: #303030;
  border-radius: 5px;
  // border: 1px solid #980000;
  border: 1px solid #4a4a4a;
  margin: 8px 0;
  transition: 0.2s;

  & > img {
  border-radius: 50%;
  transition: 0.2s;
  }

  & > div {
    border-radius: 50%;
    transition: 0.2s;
    }
  
  &:hover {
    // background: linear-gradient(160deg, rgb(158, 0, 0) 0%, rgb(61, 0, 0) 60%, rgb(0, 0, 0) 100%);
    background: #3d3d3d;
    border-color: #fff;
    cursor: pointer;
    & > img {
    border-radius: 10%;
    }
    & > div {
    border-radius: 10%;
    }
  }
`

export const GuildMenuItemStyle = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  // background: linear-gradient(160deg, rgb(158, 0, 0) 0%, rgb(61, 0, 0) 40%, rgb(0, 0, 0) 100%);
  background: #303030;
  border-radius: 5px;
  // border: 1px solid #980000;
  border: 1px solid #4a4a4a;
  margin: 8px 0;
  transition: all 0.2s;

  & > img {
    border-radius: 50%;
    width: 40px;
    height: 40px;
    transition: all 0.2s;
  }

  & > div {
    border-radius: 50%;
    width: 40px;
    min-width: 40px;
    height: 40px;
    transition: all 0.2s;
  }
  
  &:hover {
    // background: linear-gradient(160deg, rgb(158, 0, 0) 0%, rgb(61, 0, 0) 60%, rgb(0, 0, 0) 100%);
    background: #3d3d3d;
    border-color: #fff;
    cursor: pointer;
    & > img {
      border-radius: 10%;
    }
    & > div {
      border-radius: 10%;
    }
  }
`;

export const GuildMenuItemStyleLoading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  // background: linear-gradient(160deg, rgb(158, 0, 0) 0%, rgb(61, 0, 0) 40%, rgb(0, 0, 0) 100%);
  background: #303030;
  border-radius: 5px;
  // border: 1px solid #980000;
  border: 1px solid #4a4a4a;
  margin: 8px 0;

  & > div {
    // background-color: rgba(255, 0, 0, 0.5);
    background-color: #4a4a4a80;
    border-radius: 50%;
    width: 40px;
    height: 40px;
  }

  & > p {
    // background-color: rgba(255, 0, 0, 0.5);
    background-color: #4a4a4a80;
    border-radius: 5px;
    height: 25px;
    width: 30%;
    margin-top: 16px;
    margin-bottom: 16px;
  }
`;

export const GuildMenuCreateData = styled.div<{ $isShow: boolean }>`
  position: fixed;
  display: ${({ $isShow }) => $isShow ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  top: 0;
  height: 100%;
  width: 100%;
  animation: ${({ $isShow }) => $isShow ? 'guildMenuCreateDataShow' : ''} 0.5s forwards;
  @keyframes guildMenuCreateDataShow {
    from { background-color: #00000000; backdrop-filter: blur(0px); }
    to { background-color: #00000080; backdrop-filter: blur(2px); }
  }

  & > div {
    min-width: 30%;
    text-align: center;
    border-radius: 20px;
    border: #ff808080 2px solid;
    padding: 50px;
    background: linear-gradient(160deg, rgb(197 0 0) 0%, rgb(61 0 0) 60%, rgb(0 0 0) 100%);
    animation: ${({ $isShow }) => $isShow ? 'guildMenuCreateDataBoxShow' : ''} 0.5s forwards cubic-bezier(0, 1.3, 0.5, 1);
    @keyframes guildMenuCreateDataBoxShow {
      from { opacity: 0; transform: scale(0); }
      to { opacity: 1; transform: scale(1); }
    }
  }
`;

export const Container = styled.div`
  width: 60%;
  margin: 0 auto;
  color: #fff;
  font-family: "Kanit";
`;

export const AppBarStyle = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 35px;
  box-sizing: border-box;
  border-bottom: 1px solid #8f8f8f;
`;

export const Title = styled.p`
  font-size: 22px;
`;

export const InputField = styled.input`
  padding: 5px 16px;
  box-sizing: border-box;
  font-size: 20px;
  color: var(--in-color);
  font-family: "Kanit", sans-serif;
  background-color: var(--in-bg);
  border-radius: 5px;
  border: 5px solid var(--in-border);
  transition: 0.2s;
  outline: 1px solid var(--in-outline);
  width: 100%;
  &:focus {
    outline: 1px solid var(--in-outline-focus);
  }
  &::placeholder {
    color: var(--in-placeholder);
  }
`;

export const Select = styled.select`
  padding: 5px 16px;
  margin-top: 5px;
  box-sizing: border-box;
  font-size: 20px;
  color: var(--in-color);
  font-family: "Kanit", sans-serif;
  background-color: var(--in-bg);
  border-radius: 5px;
  border: 5px solid var(--in-border);
  transition: 0.2s;
  outline: 1px solid var(--in-outline);
  width: 100%;
  cursor: pointer;
  &:focus {
    outline: 1px solid var(--in-outline-focus);
  }

  & > option {
    cursor: pointer;
    &:checked {
      background-color: var(--in-option-selected);
    }
  }
`;

export const TextArea = styled.textarea`
  padding: 14px 16px;
  box-sizing: border-box;
  font-size: 16px;
  color: var(--in-color);
  font-family: "Kanit", sans-serif;
  background-color: var(--in-bg);
  border-radius: 5px;
  border: 5px solid var(--in-border);
  outline: 1px solid var(--in-outline);
  transition: all 0.2s, height 0s;
  width: 100%;
  min-height: min-content;
  &:focus {
    outline: 1px solid var(--in-outline-focus);
  }
`;

type ButtonProps = {
  variant: 'primary' | 'secondary';
};

export const Button = styled.button<ButtonProps>`
  padding: 10px 24px;
  border-radius: 5px;
  outline: none;
  border: none;
  font-family: "Kanit", sans-serif;
  font-size: 16px;
  color: #fff;
  cursor: pointer;
  margin-left: 10px;
  margin-right: 10px;
  transition: 0.2s;
  ${({ variant }) =>
    variant === 'primary' &&
    css`
      background-color: #4289ff;

      &:hover {
        background-color: #1c71ff;
      }
    `}
  ${({ variant }) =>
    variant === 'secondary' &&
    css`
      background-color: #3d3d3d;

      &:hover {
        background-color: #282828;
      }
    `}
`;

export const Login = styled.div`
  background-color: rgb(89, 115, 212);
  border-radius: 10px;
  box-shadow: 5px 5px 8px 0px #00000080;
  cursor: pointer;
  transition: 0.2s;

  & > div{
    display: flex;
    align-items: center;
    justify-content: center;
    & > span{
      position: absolute;
      background-color: rgb(70, 0, 0);
      border: 1px solid rgb(61, 0, 0);
      border-radius: 5px;
      padding: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 10;
      opacity: 0;
      transform: translateY(-20px);
      transition: 0.2s;
    }
  }

  &:hover {
    background-color: rgb(70, 102, 221);
    
    & > div{
      display: flex;
      align-items: center;
      justify-content: center;
      & > span{
        position: absolute;
        background-color: rgb(70, 0, 0);
        border: 1px solid rgb(61, 0, 0);
        border-radius: 5px;
        padding: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 10;
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
`;

export const Login2 = styled.div`
  background-color: rgb(65, 65, 65);
  border-radius: 10px;
  box-shadow: 5px 5px 8px 0px #00000080;
  transition: 0.2s;

  &:hover {
  background-color: rgb(51, 51, 51);
  }
`;

// export const PopupLoginClose = styled.span`
//   display: none;
//   position: absolute;
//   background-color: white;
//   border: 1px solid #ccc;
//   padding: 10px;
//   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
//   z-index: 1000;
// `;

export const Overlay = styled.div`
  height: 100%;
  width: 100%;
  background-color: rgb(59, 59, 59);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export const SlideOut = styled.div`
  background-color: rgb(59, 59, 59);
  animation: slideOut 1s forwards;

  @keyframes slideOut {
    0% { transform: translateY(0); }
    100% { transform: translateY(-100%); }
  }
`;

export const FadeAway = styled.div`
  animation: fadeAway 0.4s forwards;

  @keyframes fadeAway {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }
`;

export const NotFoundImg = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  height: 40%;
  animation: NotFoundImg 4s;

  @keyframes NotFoundImg {
    0% { opacity: 0; top: -50%; }
    50% { opacity: 0; top: -50%; }
    65% { opacity: 0.5; top: 5%; }
    100% { opacity: 1; top: 0%; }
  }
`;

export const NotFoundText = styled.div`
  animation: NotFoundText 5s forwards;

  @keyframes NotFoundText {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
`;

export const ShowPopupLoadingErrorBox = styled.div`
  display: flex;
  justify-content: center;
  position: fixed;
  left: 0;
  bottom: 70px;
  width: 100%;
  animation: PopupBottom 1s forwards cubic-bezier(0, 0, 0, 1);
`;

export const ShowPopupLoadingError = styled.p`
  text-align: center;
  width: 70%;
  // background: rgba(199, 0, 0, 0.75);
  background: #303030;
  padding: 10px;
  border: 1px solid rgb(31, 31, 31);
  border-radius: 5px;
`;

export const TopBarShortCutLink = styled(Link) <{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  text-decoration: none;
  word-break: keep-all;
  cursor: pointer;
  color: ${({ $isActive }) => $isActive ? 'rgb(225, 100, 100)' : '#fff'};
  margin: 0 5px;
  transition: 0.2s;

  @keyframes Zoom-in-out {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  & > svg{
    transform: scale(1);
    transition: 0.5s;
    margin-right: 10px;
  }

  &:hover {
    color: rgb(225, 100, 100);
    & > svg{
      color: #ffa1a1;
      transform: scale(1.2);
    }
  }
`;

export const ItemBarInfoHomePage = styled.button<{ $isSelect: boolean }>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(226, 101, 101, 0);
  padding: 10px;
  cursor: pointer;
  color: ${props => props.$isSelect ? 'rgb(225, 100, 100)' : '#fff'};
  transition: 0.2s;

  @keyframes Zoom-in-out {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  & > svg{
    transform: scale(1);
    margin-right: 5px;
    transition: 0.5s;
  }

  &:hover {
    color: rgb(225, 100, 100);
    border-bottom: 1px solid rgb(225, 100, 100);
    & > svg{
      color: #ffa1a1;
      transform: scale(1.3);
    }
  }
`;

export const ItemBarInfoHomePageDisable = styled.button<{ $isSelect: boolean }>`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(226, 101, 101, 0);
  padding: 10px;
  cursor: no-drop;
  color: gray;
  transition: 0.2s;

  @keyframes Zoom-in-out {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  & > svg{
    transform: scale(1);
    margin-right: 5px;
    transition: 0.5s;
  }
`;

export const BarInfoHomePage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 500px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.4);

  @media (max-width: 500px) {
    width: 100%;
    flex-direction: column;
  }
`;

export const DevBoxHomePage = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-direction: column;
  background-color: rgb(210, 48, 48);
  background-position: center center;
  box-shadow: black 4px 7px 20px 0px;
  width: 220px;
  height: 320px;
  border-radius: 10px;
  margin: 10px;
  overflow: hidden;
  transform: scale(1);
  transition: 0.5s;

  & > div {
    display: flex;
    flex-direction: column;
    text-align: start;
    padding: 10px;
  }

  & > p {
    position: absolute;
    z-index: -1;
    background-position: center;
    background-size: cover;
    width: 100%;
    height: 100%;
    margin: 0;
    border-radius: 10px;
    filter: blur(1px);
    clip-path: inset(0);
    transition: 0.5s;
  }

  &:hover {
    transform: scale(1.1);

    & > p {
      filter: blur(0px);
    }
  }
`;

export const HomePage1Button1 = styled.button`
  background: hsl(356, 73%, 58%);
  color: black;
  border: rgb(255 90 90) 1px solid;
  padding: 10px;
  font-size: 20px;
  font-family: Kanit;
  min-width: 130px;
  border-radius: 4px;
  cursor: pointer;
  transition: 0.5s;

  &:hover {
    background: rgb(255, 153, 160);
  }
`;

export const HomePage1Button2 = styled.button`
background: rgba(0, 0, 0, 0);
color: rgb(255, 255, 255);
border: 1px solid rgb(255, 90, 90);
padding: 10px;
font-size: 20px;
font-family: Kanit;
min-width: 130px;
border-radius: 4px;
cursor: pointer;
transition: 0.5s;

  &:hover {
    background: rgba(255, 90, 90, 0.5);
  }
`;

export const ContactPage1 = styled.div`
    margin: 10px;
    background: linear-gradient(160deg, rgb(197 0 0) 0%, rgb(61 0 0) 70%, rgb(0 0 0) 100%);
    border-radius: 10px;
    box-shadow: black 4px 7px 20px 0px;
    width: min-content;
    display: flex;
    flex-direction: row;
`;

export const DashSidebar = styled.div`
  

    & > .dashCategory {
      left: 0;
      z-index: 5;
      min-width: fit-content;
      display: flex;
      flex-direction: row;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.8, 0, 0.2, 1);

      & > .dashMenu {
        scrollbar-width: none;
        background-color: #ff666666;
        background-color: #f64242d1;
        background-color: #ff90905f;
        background-color: #594d4d42;
        backdrop-filter: brightness(0.5) blur(5px);
        backdrop-filter: brightness(0.8) blur(20px);
        box-shadow: 1px 0px 5px #0000004d;
        box-shadow: 1px 0px 5px #0000008d;
        max-width: 90vw;
        max-height: 100%;
        // border-radius: 30px;
        transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1), max-width 1s cubic-bezier(0.2, 0.5, 0, 1);

        & > div {
          position: relative;
          display: flex;
          flex-direction: column;
          padding: 20px;
          height: 100%;
          overflow: hidden;
          transition: all 1s cubic-bezier(0.2, 0.5, 0, 1);

          & > #hamburger {
            position: absolute;
            left: 5px;
            width: 40px;
            height: 47px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 1s cubic-bezier(0.2, 0.5, 0, 1);
            & > div {
              position: absolute;
              width: 30px;
              height: 30px;
              border-radius: 5px;
              z-index: 3;
            }
            & > svg {
              z-index: 4;
            }
          }

          & > #target {
            margin-left: 30px;
            margin-bottom: 20px;

            & > div {
              position: relative;

              & > #current {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #ff47474d;
                padding: 10px;
                border-radius: 10px;
                cursor: pointer;
                overflow: hidden;
                transition: 0.3s;

                &:hover {
                  background: #db2c2c5e;
                }

                & > div {
                  display: flex;
                  justify-content: left;
                  align-items: center;
                  flex-direction: row;

                  & > img {
                    width: 25px;
                    border-radius: 50%;
                  }

                  & > div {
                    width: 25px;
                    height: 25px;
                    background-color: rgba(255, 0, 0, 0.5);
                    border-radius: 50%;
                    align-content: center;
                    text-align: center;
                    font-size: 15px;
                    font-weight: bold;
                  }

                  & > span {
                    font-size: 18px;
                    margin-left: 10px;
                    align-content: center;
                  }
                }
              }
              & > #all {
                position: absolute;
                // display: flex;
                // flex-direction: column;
                pointer-events: all;
                left: -10px;
                width: calc(100% + 20px);
                opacity: 1;
                transform: scale(100%);
                max-height: 70vh;
                z-index: 10;
                margin-top: 10px;
                padding: 10px;
                border-radius: 10px;
                box-shadow: #00000066 0px 0px 5px 2px;
                background: #9a4141;
                background: #342d2d;
                transition: 0.2s;
                overflow-x: hidden;
                overflow-y: scroll;

                & > #search {
                  position: relative;
                  display: flex;
                  align-items: center;
                  width: 100%;
                  height: 40px;
                  margin-bottom: 5px;

                  & > input {
                    position: fixed;
                    height: 40px;
                    padding: 0 20px;
                    border-radius: 10px;
                    background: #b45151;
                    background: #1b1313;
                    border: #c36060 solid 5px;
                    border: #2b2525 solid 3px;

                    &::placeholder {
                      color: #ffffff90;
                    }
                  }
                }

                & > #guild, & > #user {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 5px 10px;
                  border-radius: 10px;
                  margin-bottom: 5px;
                  height: 40px;
                  cursor: pointer;
                  overflow: hidden;
                  transition: 0.2s cubic-bezier(0.2, 0.5, 0, 1);

                  &:hover {
                    background: #693e3e;
                  }

                  & > div {
                    display: flex;
                    justify-content: left;
                    align-items: center;
                    flex-direction: row;

                    & > img {
                      width: 25px;
                      border-radius: 50%;
                    }

                    & > div {
                      width: 25px;
                      height: 25px;
                      background-color: rgba(255, 0, 0, 0.5);
                      border-radius: 50%;
                      align-content: center;
                      text-align: center;
                      font-size: 15px;
                      font-weight: bold;
                    }

                    & > span {
                      font-size: 18px;
                      margin-left: 10px;
                      align-content: center;
                    }
                  }
                }

                &::-webkit-scrollbar-track {
                  background-color: transparent;
                }
              }
              & > #all.hide {
                // transform: scale(80%);
                max-height: -50vh;
                opacity: 0;
                pointer-events: none;
              }
            }
          }

          & > #navigate {
            overflow-x: hidden;
            overflow-y: scroll;

            & > div {
              // border-left: 1px solid red;

              & > #sidebar {
                transition: 1s cubic-bezier(0.2, 0.5, 0, 1);

                & > #name {
                  overflow: hidden;
                  transition: 1s cubic-bezier(0.2, 0.5, 0, 1);
                }
              }

              & > #sub-menu {

                & > div > div {
                  overflow: hidden;
                  transition: all 1s cubic-bezier(0.2, 0.5, 0, 1);
                }
              }
            }
            &::-webkit-scrollbar-track {
              background-color: #00000000;
            }
          }
        }
      }

      & > #backArrow {
        z-index: 10;
        position: absolute;
        left: 110%;
        transform: translateY(10px);
        margin: 10px 0px 0px;
        height: fit-content;
        transition: 0.5s;

        & > .dashMenuArrow {
          display: none;
          transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);
          background-color: rgba(255, 138, 138, 0.5);
          cursor: pointer;
          height: 30px;
          width: 30px;
          border-radius: 10px;
        }
      }
    }

    & > .dashCategory.hide {
      position: absolute;

      & > .dashMenu {
        min-width: 40px;
        max-width: 40px;

        & > div {
          padding: 20px 0;

          & > #hamburger {
            left: 0px;
          }

          & > #target > div > #current {
            transform: translateX(10px);
          }

          & > #navigate {
            & > div {
              & > #sidebar {
                transform: translateX(16px);

                & > #name {
                  max-width: 0%;  
                }
              }

              & > #sub-menu {
                margin: 5px 0px;

                & > div > div {
                  max-width: 30px;
                  margin: 5px 0px;
                  transform: translateX(-5px);
                }
              }
            }
          }
        }
      }
      & > .dashMenu.overlay {
        max-width: 90vw;

        & > div {
          padding: 20px;

          & > #hamburger {
            left: 5px;
          }

          & > #target > div > #current {
            transform: translateX(0px);
          }

          & > #navigate {
            & > div {
              & > #sidebar {
                transform: translateX(0);

                & > #name {
                  max-width: 100%;  
                }
              }

              & > #sub-menu {
                margin: 5px;

                & > div > div {
                  max-width: 100%;
                  margin: 5px;
                  transform: translateX(0);
                }
              }
            }
          }
        }
      }
      & > .dashMenu:not(.overlay) > div > #navigate {
        &::-webkit-scrollbar {
          width: 0px;
        }
      }
      
      & ~ #panel {
        padding-left: 40px;
      }
    }

    & > .dashMenuBackDrop {
      display: none;
    }
`;

export const DashPage = styled.div`
  width: calc(100% - 40px);
  // height: 100%;
  height: calc(100vh - 60px);
  margin-left: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  & > div {
    position: relative;
    background-color: #ffcece1a;
    // height: 85vh;
    // width: 95vw;
    height: 100%;
    width: 100%;
    // border-radius: 30px;
    display: flex;
    flex-direction: row;

    & > #loading {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      display: none;
      align-items: center;
      justify-content: center;

      &.show {
        display: flex;
      }
    }
  }
`;

export const DashCategoryMenu = styled.div<{ $isShow: boolean }>`

  @keyframes dashSidebarShow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(90deg); }
  }
  @keyframes dashSidebarHide {
    0% { transform: rotate(90deg); }
    100% { transform: rotate(0deg); }
  }

  & > #sidebar {
    display: flex;
    color: #ffb8b8;
    cursor: pointer;
    font-weight: bold;
    transition: 0.3s;

    & > #arrow {
      transition: 0.3s;
      transform: ${({ $isShow }) => $isShow ? 'rotate(90deg)' : 'rotate(0deg)'};
    }
    & > #name {
      padding-left: 5px;
    }
    &:hover {
      color: #ffffff;
    }
  }
  & > #sub-menu {
    overflow: hidden;
    transition: 0.3s;
    padding-left: 10px;
    margin: 5px;
    opacity: ${({ $isShow }) => ($isShow ? '1' : '0')};
    height: ${({ $isShow }) => ($isShow ? 'auto' : '0')};

    & > div {
      transition: transform 0.3s;
      transform: ${({ $isShow }) => $isShow ? 'translateY(0%)' : 'translateY(-100%)'};

      & > div {
        display: flex;
        align-items: center;
        padding: 5px;
        margin: 5px;
        cursor: pointer;
        border-radius: 10px;
        transition: 0.3s, background-color 0s;

        & > svg {
          height: 20px;
          width: 20px;
          margin-right: 5px;
        }
        
        &:hover {
          background-color: #ff47474d;
        }
        & > img {
          margin: 0px 10px 0px 5px;
        }
      }
    }
  }
`;

export const FeatureDropdown = styled.div<{ $isShow: boolean }>`

  @keyframes dashSidebarShow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(90deg); }
  }
  @keyframes dashSidebarHide {
    0% { transform: rotate(90deg); }
    100% { transform: rotate(0deg); }
  }

  & > #sidebar {
    display: flex;
    color: #ffb8b8;
    cursor: pointer;
    font-weight: bold;
    transition: 0.3s;

    & > #arrow {
      animation: ${({ $isShow }) => $isShow ? 'dashSidebarShow' : 'dashSidebarHide'} 0.3s forwards;
    }
    & > #name {
      padding-left: 5px;
    }
    &:hover {
      color: #ffffff;
    }
  }
  & > #sub-menu {
    overflow: hidden;
    transition: 0.3s;
    padding-left: 10px;
    margin: 5px;
    opacity: ${({ $isShow }) => ($isShow ? '1' : '0')};
    height: ${({ $isShow }) => ($isShow ? 'auto' : '0')};

    & > div {
      transition: transform 0.3s;
      transform: ${({ $isShow }) => $isShow ? 'translateY(0%)' : 'translateY(-100%)'};

      & > div {
        display: flex;
        align-items: center;
        padding: 5px;
        margin: 5px;
        cursor: pointer;
        border-radius: 10px;
        transition: 0.3s;
        
        &:hover {
          background-color: #ff47474d;
        }
        & > img {
          margin: 0px 10px 0px 5px;
        }
      }
    }
  }
`;

export const DashPanel = styled.div`
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  /* animation: fadeIn .4s ease forwards; */

  & > div {
    position: relative;
    padding-bottom: 100px;

    & > div {
      position: absolute;
      padding: 20px;
      width: 100%;
      opacity: 0;
      // transition: 5s;

      & > div {
        & > #title {
          font-size: 36px;
          font-weight: 900;
          margin-left: 5%;
        }
      }

      &.show {
        opacity: 1;
        pointer-events: all;
        // transition-timing-function: cubic-bezier(0, 1, 0.5, 1);
      }
      &.hide {
        opacity: 0;
        pointer-events: none;
        // transition-timing-function: cubic-bezier(0.5, 0, 1, 0);
      }
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateX(30px); }
    to   { opacity: 1; transform: none; }
  }
`;

export const DashPageServerOverview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, 250px);
  gap: 16px;
  justify-content: center;

  & > div {
    position: relative;
    border: 2px solid;
    padding: 10px 20px;
    width: 250px;
    height: 100px;
    border-radius: 15px;

    & > #title {
      display: flex;
      flex-direction: row;
      align-items: center;

      & > #icon {
        width: 30px;
        height: 30px;
        padding: 5px;
        border-radius: 7px;
      }

      & > h1, & > #title {
        margin-left: 10px;
        font-weight: bold;
        font-size: 20px;
      }
    }

    & > #main {
      position: absolute;
      font-weight: bold;
      font-size: 25px;
      text-shadow: 5px 5px 2px #0000005a;
      bottom: 0px;
      right: 10px;
    }

    & > #sub {
      width: 225px;
    }
  }
`;

export const DashPageServerGeneralInfo = styled.div`
  background-color: #ff4d4d4d;
  padding: 20px;
  border-radius: 10px;

  & > div {
    // background-color: #ff4d4d4d;
    display: flex;
    flex-direction: row;
    padding: 5px 20px;
    margin: 5px;
    border-radius: 10px;
    border: #ff4d4d4d 3px solid;
  }
`;

export const DashPageServerGeneralSettings = styled.div`
  margin: 20px;
`;

export const PricingTableWrapper = styled.div`
  width: 90%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const PricingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  font-family: "Kanit";
  background: rgb(255, 153, 153);
  backdrop-filter: blur(8px);
  min-width: 600px;

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;

export const PricingTH = styled.th`
  padding: 16px 24px;
  text-align: center;
  background: #b20000;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border-bottom: 2px solid #9e0000;

  @media (max-width: 600px) {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
`;

export const PricingTD = styled.td`
  padding: 16px 24px;
  text-align: center;
  font-size: 0.95rem;
  border-bottom: 1px solid #9e0000;
  color: #000;
  background-color: #ffc7c7;

  @media (max-width: 600px) {
    padding: 12px 16px;
    font-size: 0.85rem;
  }
`;

export const PlanName = styled(PricingTD)`
  font-weight: 600;
  background-color: #ffe5e5;
  text-align: left;
`;

export const HighlightTD = styled(PricingTD)`
  background: linear-gradient(to bottom right, #b20000, #b20000);
  font-weight: 700;
  color: #ffffff;
`;

export const DashPageServerGeneralPremium = styled.div<{ $premiumType: 0 | 1 }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  & > #type {
    position: sticky;
    display: flex;
    justify-content: space-between;
    flex-direction: row;
    border-radius: 30px;
    background-color: #d04444;
    overflow: hidden;
    top: 20px;
    z-index: 2;
    box-shadow: 2px 3px 5px 0px #00000080;

    & > #Monthly, & > #Yearly {
      text-align: center;
      width: 100px;
      padding: 10px;
      cursor: pointer;
      transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);
      font-weight: bold;
      font-size: large;
      z-index: 2;
    }
    & > #Monthly {
      color: ${(props) => props.$premiumType == 0 ? '#d20000' : '#ffdcdc'};
    }
    & > #Yearly {
      color: ${(props) => props.$premiumType == 1 ? '#d20000' : '#ffdcdc'};
    }
    & > #switch {
      position: absolute;
      left: -400px;
      width: 500px;
      height: 100%;
      padding: 0 10px;
      border-radius: 30px;
      background-color: #ffbdbd;
      transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);
      z-index: 1;
      transform: translateX(${(props) => props.$premiumType == 0 ? '0%' : '100%'});
    }
  }

  & > #pricing {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 20px;
    gap: 20px;

    &  > div {
      background: linear-gradient(135deg, #f83f3f, #560505);
      border-radius: 20px;
      width: calc((100% - 50px) / 3);
      min-width: 300px;
      min-height: 400px;
      padding: 20px 15px;
      text-align: center;
      position: relative;
      box-shadow: 2px 6px 20px 0px rgb(0 0 0 / 50%);
      transition: all 0.3s ease-in-out;
      overflow: hidden;
      color: white;

      & > h1 {
        font-size: 2rem;
        margin: 0;
      }

      & > div {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        & > #text {
          text-align: left;
        }

        & > p {
          display: flex;
          flex-direction: row;
          color: lightgray;
          font-size: small;
        }
      }

      & > hr {
        border: 1px solid #ffffff8c;
        border-radius: 1px;
        margin: 10px;
      }

      & > button {
        padding: 8px 16px;
        color: #fff;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        transition: box-shadow 0.5s;

        &:hover {
          /* box-shadow: inset 0 4px 6px rgba(0,0,0,0.3); */
        }
      }

      &::after {
        content: '';
        position: absolute;
        top: -20%;
        right: 0;
        width: 200%;
        height: 10%;
        filter: blur(10px);
        background-color: white;
        transform: rotate(-30deg) translateY(0);
        transition: 0.5s ease-in-out;
      }

      &:hover {
        transform: translateY(-10px);
        
        &::after {
          transform: rotate(-30deg) translateY(1500%);
        }
      }
    }

    & > #free {
      background: linear-gradient(135deg, #c7e700, #445407);
      color: #ffffffff;
      text-shadow: 3px 2px 2px #4f6a23;

      & > div {
        & > #text {
          & > b {
            color: #dbffc6;
            text-shadow: #085b00 0px 0px 5px;
          }
        }
      }

      & > button {
        background: linear-gradient(135deg, #b4d101, #445407);
        /* animation: nhover 0.2s forwards; */


        &:hover {
          /* animation: hover 0.2s forwards; */
        }

        @keyframes nhover {
          0%   { background: linear-gradient(135deg, #b4d101, #445407); }
          10%  { background: linear-gradient(115deg, #b4d101, #445407); }
          20%  { background: linear-gradient(95deg, #b4d101, #445407); }
          30%  { background: linear-gradient(75deg, #b4d101, #445407); }
          40%  { background: linear-gradient(55deg, #b4d101, #445407); }
          50%  { background: linear-gradient(35deg, #b4d101, #445407); }
          60%  { background: linear-gradient(15deg, #b4d101, #445407); }
          70%  { background: linear-gradient(-15deg, #b4d101, #445407); }
          80%  { background: linear-gradient(-35deg, #b4d101, #445407); }
          90%  { background: linear-gradient(-55deg, #b4d101, #445407); }
          100% { background: linear-gradient(-75deg, #b4d101, #445407); }
        }
        @keyframes hover {
          100% { background: linear-gradient(135deg, #b4d101, #445407); }
          90%  { background: linear-gradient(115deg, #b4d101, #445407); }
          80%  { background: linear-gradient(95deg, #b4d101, #445407); }
          70%  { background: linear-gradient(75deg, #b4d101, #445407); }
          60%  { background: linear-gradient(55deg, #b4d101, #445407); }
          50%  { background: linear-gradient(35deg, #b4d101, #445407); }
          40%  { background: linear-gradient(15deg, #b4d101, #445407); }
          30%  { background: linear-gradient(-15deg, #b4d101, #445407); }
          20%  { background: linear-gradient(-35deg, #b4d101, #445407); }
          10%  { background: linear-gradient(-55deg, #b4d101, #445407); }
          0%   { background: linear-gradient(-75deg, #b4d101, #445407); }
        }
      }
    }
    
    & > #tier1 {
      background: linear-gradient(135deg, #e8d722, #5e4b0b);
      color: #ffffffff;
      text-shadow: 3px 2px 2px #645d0b;

      & > div {
        & > #text {
          & > b {
            color: #feffe8;
            text-shadow: #000 0px 0px 5px;
          }
        }
      }

      & > button {
        background: linear-gradient(135deg, #e8d722, #5e4b0b);


        &:hover {
          /* background: linear-gradient(135deg, #e8d722, #5e4b0b); */
        }
      }
    }
    
    & > #tier2 {
      background: linear-gradient(135deg, #f83f3f, #560505);
      color: #ffffffff;
      text-shadow: 3px 2px 2px #622323;

      & > div {
        & > #text {
          & > b {
            color: #ffe3e3;
            text-shadow: #ff0000 0px 0px 5px;
          }
        }
      }

      & > button {
        background: linear-gradient(135deg, #f83f3f, #560505);


        &:hover {
          /* background: linear-gradient(135deg, #f83f3f, #560505); */
        }
      }
    }
  }

  & > #table {
    display: flex;
    flex-direction: column;
    width: 100%;

    & > #line {
      border: 1px #ffffff80 solid;
      margin: 50px 50px;
    }

    & > #ptable {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-radius: 12px;
      transition: all 0.5s;
    }
  }
`;

export const ChangePopup = styled.div<{ $isShow: boolean | null }>`
  display: ${({ $isShow }) => $isShow === null ? 'none' : 'flex'};
  justify-content: center;

  & > div {
    position: fixed;
    z-index: 2;
    bottom: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    padding: 10px;
    border-radius: 10px;
    background-color: #9b2828;
    transition: 0.5s;
    animation: ${({ $isShow }) => $isShow ? 'dashChangePopupShow cubic-bezier(0.3, 1.5, 0.5, 1)' : 'dashChangePopupHide cubic-bezier(0.5, 0, 0.7, -0.5)'} 1s forwards;

    & > div {
      padding: 0px 30px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      & > div {
        cursor: pointer;
        margin: 0px 10px;
        padding: 10px;
        border-radius: 10px;
        background-color: #d04444;
      }
    }
  }

  @keyframes dashChangePopupShow {
    0% { opacity: 0; display: flex; }
    10% { opacity: 0; transform: translateY(100%); }
    100% { opacity: 1; transform: translateY(-100%); }
  }
  @keyframes dashChangePopupHide {
    0% { opacity: 1; transform: translateY(-100%); }
    90% { opacity: 0; transform: translateY(100%); }
    100% { opacity: 0; display: none; }
  }
`;

export const PopupStatusSaving = styled.div<{ $isShow: boolean | null }>`
  display: ${({ $isShow }) => $isShow === null ? 'none' : 'flex'};
  justify-content: center;
  position: fixed;
  height: 100%;
  width: 100%;
  top: 0;
  bottom: 0;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: ${({ $isShow }) => $isShow ? 'dashPopupSavingShow' : 'dashPopupSavingHide'} 0.5s forwards;

  & > div {
    padding: 50px;
    border-radius: 30px;
    background-color: #9b2828;
    transition: 0.2s;
    animation: ${({ $isShow }) => $isShow ? 'dashPopupSavingBoxShow cubic-bezier(0.3, 1.5, 0.5, 1)' : 'dashPopupSavingBoxHide cubic-bezier(0.5, 0, 0.7, -0.5)'} 0.3s forwards;
  }

  @keyframes dashPopupSavingShow {
    0% { z-index: 3; }
    10% { z-index: 3; backdrop-filter: blur(0px); background-color: #00000000; }
    100% { z-index: 3; backdrop-filter: blur(3px); background-color: #00000066; }
  }
  @keyframes dashPopupSavingHide {
    0% { z-index: 3; backdrop-filter: blur(3px); background-color: #00000066; }
    90% { z-index: 3; backdrop-filter: blur(0px); background-color: #00000000; }
    100% { z-index: -1; }
  }

  @keyframes dashPopupSavingBoxShow {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes dashPopupSavingBoxHide {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0); }
  }
`;

export const DashPageServerFunctionWelcomeGoodBye = styled.div<{ $isEnabled: boolean[] }>`
  width: 100%;
  display: flex;
  justify-content: center;
  min-height: 100px;

  & > div {
    display: flex;
    flex-direction: column;
    margin: 10px;
    width: 100%;
    border-radius: 10px;
    overflow: hidden;
    transition: all 0.5s ease-in-out;
    /* height: ${({ $isEnabled }) => $isEnabled[0] ? 'max-content' : '100px'}; */
    max-height: max-content;
    background-color: #a327274e;
    box-shadow: 0px 0px 20px 0px #0000008f;
    transition: all 0.5s ease-in-out;

    & > #title {
      display: flex;
      position: relative;
      z-index: 2;
      justify-content: space-between;
      transform: none;
      min-height: 100px;
      background: linear-gradient(135deg, #703838, #5c2b2b);
      box-shadow: 0px 0px 20px 0px #0000008f;
      border-radius: 10px;
      padding: 30px 30px;
      & > #name {
        font-size: 25px;
        font-weight: bold;
      }
      & > #status {
        position: relative;
        display: flex;
        align-items: center;
        // width: 65px;
        // height: 30px;
        width: 80px;
        height: 40px;
        cursor: pointer;

        & > #background {
          width: 80px;
          height: 40px;
          border-radius: 20px;
          transition: 0.5s;
          background-color: ${({ $isEnabled }) => $isEnabled[0] ? '#f07575' : '#808080'};
        }
        & > #switch {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 20px;
          box-shadow: 0px 0px 10px 1px #00000080;
          transition: 0.5s cubic-bezier(0.3, 0.3, 0, 1.5);
          background-color: ${({ $isEnabled }) => $isEnabled[0] ? '#ffcccc' : '#fff'};
          transform: ${({ $isEnabled }) => $isEnabled[0] ? 'translateX(40px)' : 'translateX(0px)'};
        }
        & > #text {
          position: absolute;
          font-size: 20px;
          font-weight: bold;
          padding: 0 10px;
          transition: 0.5s cubic-bezier(0.3, 0.3, 0, 1);
          transform: ${({ $isEnabled }) => $isEnabled[0] ? 'translateX(0px)' : 'translateX(35px)'};
        }
      }
    }

    & > div {
      transition: all 0.5s ease-in-out;
      border-radius: 10px;
      padding: ${({ $isEnabled }) => $isEnabled[0] ? '15px 30px' : '0px 30px'};
      max-height: ${({ $isEnabled }) => $isEnabled[0] ? '100%' : '0px'};
      overflow: hidden;
      /* transform: ${({ $isEnabled }) => $isEnabled[0] ? 'translateY(0px)' : 'translateY(-100%)'}; */

      & > #line {
        border-bottom: 2px #ff9999 solid;
        margin: 20px 20px;
      }
  
      & > #channel, & > #user {
        & > #title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          & > #name {
            font-size: 20px;
            font-weight: bold;
            display: flex;
            flex-direction: row;
          }
          & > #status {
            position: relative;
            display: flex;
            align-items: center;
            // width: 45px;
            // height: 25px;
            width: 55px;
            height: 30px;
            cursor: pointer;
    
            & > #background {
              width: 55px;
              height: 30px;
              border-radius: 20px;
              transition: 0.5s;
            }
            & > #switch {
              position: absolute;
              width: 30px;
              height: 30px;
              border-radius: 15px;
              box-shadow: 0px 0px 10px 1px #00000080;
              transition: 0.5s cubic-bezier(0.3, 0.3, 0, 1.5);
            }
            & > #text {
              position: absolute;
              font-size: 17px;
              font-weight: bold;
              padding: 0 10px;
              transition: 0.5s cubic-bezier(0.3, 0.3, 0, 1);
            }
          }
        }
        & > #message {
          margin-top: 20px;
          transition: all 0.5s;

          & > div {
            display: flex;
            flex-direction: row;
            justify-content: space-around;

            & > div {
              width: 100%;
              margin: 0 10px;

              & > h5 {
                display: flex;
                flex-direction: row;
                margin-top: 10px;
                word-break: keep-all;
              }
              
              & > #variables {
                margin-left: 10px;
                & > div {
                  color: #bbb;

                  & > code {
                    color: #ff7979;
                    padding-right: 5px;
                  }
                }
              }
            }

            & > #editor {
              display: flex;
              flex-direction: column;

              & > h5 {
                & > div {
                  position: relative;
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  margin-left: 5px;

                  & > svg {
                    margin-left: 5px;
                    font-size: large;
                  }
                }
              }

              & > #embed {
                margin-bottom: 10px;
              }
            }
            
            @media (max-width: 1000px) {
              flex-direction: column;

              & > div {
                margin: 10px 0;
              }
            }
          }
        }
      }

      & > #channel {
        & > #title {
          & > #status {
            & > #background {
              background-color: ${({ $isEnabled }) => $isEnabled[1] ? '#f07575' : '#808080'};
            }
            & > #switch {
              background-color: ${({ $isEnabled }) => $isEnabled[1] ? '#ffcccc' : '#fff'};
              transform: ${({ $isEnabled }) => $isEnabled[1] ? 'translateX(30px)' : 'translateX(0px)'};
            }
            & > #text {
              transform: ${({ $isEnabled }) => $isEnabled[1] ? 'translateX(0px)' : 'translateX(25px)'};
            }
          }
        }
      }
      & > #user {
        & > #title {
          & > #status {
            & > #background {
              background-color: ${({ $isEnabled }) => $isEnabled[2] ? '#f07575' : '#808080'};
            }
            & > #switch {
              background-color: ${({ $isEnabled }) => $isEnabled[2] ? '#ffcccc' : '#fff'};
              transform: ${({ $isEnabled }) => $isEnabled[2] ? 'translateX(30px)' : 'translateX(0px)'};
            }
            & > #text {
              transform: ${({ $isEnabled }) => $isEnabled[2] ? 'translateX(0px)' : 'translateX(25px)'};
            }
          }
        }
      }
    }
  }
`;

export const DashPageServerFunctionSend = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  & > #new {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90%;
    padding: 10px;
    transition: 0.5s;
    cursor: pointer;
    border-radius: 5px;
    border: #ff7979 1px solid;
    background-color: #8a0909;

    & > svg {
      margin-right: 5px;
    }

    &:hover {
      box-shadow: inset 0px 0px 0px 2px #ffdbdb;;
      background-color: #ad2929;
    }
  }
`;

export const InputRadio = styled.div<{ $isSelect: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 10px 0px;

  &::before {
    content: '';
    width: 15px;
    height: 15px;
    border-radius: 50%;
    margin-right: 10px;
    border: #ffa0a0 2px solid;
    box-sizing: border-box;
    transition: all 0.5s;
    background-color: ${({ $isSelect }) => $isSelect ? '#ff8080' : '#ff808000'};
  }

  &:hover::before {
    background-color: ${({ $isSelect }) => $isSelect ? '#ff8080' : '#ff8080b3'};
  }
`;

export const InputSearch = styled.input`
  padding: 5px 16px;
  box-sizing: border-box;
  font-size: 20px;
  color: #fff;
  font-family: "Kanit", sans-serif;
  background-color: #851f1f;
  border-radius: 5px;
  border: 5px solid #9d2f2f;
  transition: 0.2s;
  outline: 1px solid #ffffff00;
  width: 100%;
  &:focus {
    outline: 1px solid #ffffff99;
  }
  &::placeholder {
    color: #a6a6a6;
  }
`;

export const ButtonSubmit = styled.button`
  color: #fff;
  padding: 5px 20px;
  margin: 10px;
  background: #9b1d1d;
  border-radius: 10px;
  cursor: pointer;
  border-color: #ce5959;
`;

// export const InputRadio = styled.div<{ isSelected: boolean }>`
//   width: 60px;
//   height: 60px;
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   border-radius: 50%;
//   position: relative;
//   font-size: 14px;
//   font-weight: bold;
//   color: ${({ isSelected }) => (isSelected ? 'white' : '#333')};
//   cursor: pointer;
//   transition: all 0.3s ease-in-out;

//   /* ตัววงกลม */
//   background-color: ${({ isSelected }) => (isSelected ? '#4caf50' : 'transparent')};
//   z-index: 1;

//   /* ขอบด้านนอก */
//   &::before {
//     content: '';
//     position: absolute;
//     top: -8px; /* ระยะห่างระหว่างขอบและตัววงกลม */
//     left: -8px;
//     right: -8px;
//     bottom: -8px;
//     border: 3px solid ${({ isSelected }) => (isSelected ? '#4caf50' : '#ccc')};
//     border-radius: 50%;
//     z-index: 0;
//     transition: all 0.3s ease-in-out;
//   }

//   &:hover::before {
//     border-color: #888;
//   }
// `;

export const Spinner_lds_ring = styled.div<{ $size?: number, $border?: number, $color?: string }>`
  display: inline-block;
  position: relative;
  width: ${(props) => `${props.$size}px`};
  height: ${(props) => `${props.$size}px`};
  color: ${(props) => `${props.$color}`};

  & > div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: ${(props) => `calc(${props.$size}px - 16px)`};
    height: ${(props) => `calc(${props.$size}px - 16px)`};
    margin: 8px;
    border: ${(props) => `${props.$border}px`} solid currentColor;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: currentColor transparent transparent transparent;
  }

  & > div:nth-child(1) {
    animation-delay: -0.45s;
  }

  & > div:nth-child(2) {
    animation-delay: -0.3s;
  }

  & > div:nth-child(3) {
    animation-delay: -0.15s;
  }

  & > div:nth-child(4) {
    animation-delay: 0s;
  }

  @keyframes lds-ring {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export const ComMenu = styled.div<{ $windowWidth: number, $topHeight: number, $FooterHeight: number, $commandsVisibility: boolean[], $menuActive: boolean, }>`
  position: fixed;
  display: flex;
  flex-direction: row;

  & > div#menu {
    background-color: #ff626220;
    border-right: 2px solid #ffaeaeb3;
    transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);
    width: 20vw;
    min-width: 250px;
    height: calc(100vh - ${props => props.$topHeight + props.$FooterHeight}px);
    overflow-y: overlay;
    overflow-x: hidden;

    & > div {
      position: relative;
      padding: 10px;
      transition: 0.5s;
      width: calc(100% - 20px);
      transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);

      & > h1 {
        position: absolute;
        z-index: 2;
        left: 0;
        top: 0;
        width: 20vw;
        min-width: 250px;
        height: 50px;
        background-color: #b62626;
        text-align: center;
        margin: 0;
        padding: 15px 0 15px 0;
        border-radius: 10px;
        border-bottom: 1px solid white;
        transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);
      }

      & > #search {
        display: flex;
        z-index: 2;
        justify-content: center;
        // position: fixed;
        position: sticky;
        height: 50px;
        width: 100%;
        // width: 20%;
        // min-width: 250px;
        top: 0;
        left: 0;
        margin: 80px 0 0 0;

        & > input {
          color: white;
          // text-align: center;
          height: 40px;
          // width: 18vw;
          // min-width: 230px;
          font-size: 15px;
          margin: 10px 0px;
        }
      }

      & > div {
        margin-top: 10px;

        & > div {
          overflow: hidden;
          & > h3 {
            margin: 0;
            cursor: pointer;
            align-items: center;
            transition: 0.2s;
            display: flex;
            flex-direction: row;

            & > div {
              transition: transform 0.2s;
              display: flex;
              justify-content: center;
              align-items: center;
              width: 10px;
              height: 10px;
              margin: 5px;
            }

            &:hover {
              color: #ffb6b6;
              // transform: translateX(10px);
            }
          }

          & > div {
            margin-left: 20px;
            overflow: hidden;

            & > div {
              transition: all 0.3s;
    
              & > div {
                cursor: pointer;
                transition: 0.2s;
    
                &:hover {
                  color: #ffb6b6;
                  transform: translateX(10px);
                }
              }
            }
          }

          & > div.slashCommands > div {
            opacity: ${(props) => props.$commandsVisibility[0] ? '1' : '0'};
            transform: translateY(${(props) => props.$commandsVisibility[0] ? '0%' : '-100%'});
            height: ${(props) => props.$commandsVisibility[0] ? 'auto' : '0px'};
          }
          & > div.prefixCommands > div {
            opacity: ${(props) => props.$commandsVisibility[1] ? '1' : '0'};
            transform: translateY(${(props) => props.$commandsVisibility[1] ? '0%' : '-100%'});
            height: ${(props) => props.$commandsVisibility[1] ? 'auto' : '0px'};
          }

          & > h3.slashCommands > div {
            transform: rotateZ(${(props) => props.$commandsVisibility[0] ? '90deg' : '0'});
          }
          & > h3.prefixCommands > div {
            transform: rotateZ(${(props) => props.$commandsVisibility[1] ? '90deg' : '0'});
          }
        }
      }
    }
  }

  & > .comMenuArrow {
    position: fixed;
    z-index: 10;
    top: 70px;
    left: 10px;
    display: none;
    transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);
    background-color: rgba(255, 138, 138, 0.5);
    cursor: pointer;
    height: 30px;
    width: 30px;
    border-radius: 10px;
    padding: 0;
    overflow: visible;
    align-items: center;
    justify-content: center;
    transform: translateX(${(props) => props.$menuActive ? 'clamp(250px, 20vw, 20vw)' : '0%'}) rotateY(${(props) => props.$menuActive ? '0deg' : '180deg'});
  }

  & > .comMenuBackDrop {
    position: fixed;
    z-index: -5;
    display: none;
    width: 100vw;
    height: 100vh;
    transition: 0.5s;
  }

  &::-webkit-scrollbar {
    width: 3px;
  }

  @media (max-width: 1000px) {
    & > div#menu {
      position: absolute;
      z-index: 5;
      min-width: 250px;
      width: 20vw;
      height: calc(100vh - ${props => props.$topHeight}px);
      backdrop-filter: blur(5px);
      transform: translateX(${(props) => props.$menuActive ? '0%' : '-100%'});
    }

    & > .comMenuArrow {
      display: flex;
    }

    & > .comMenuBackDrop {
      display: block;
      background-color: ${(props) => props.$menuActive ? '#0000003f' : '#00000000'};
      backdrop-filter: blur(${(props) => props.$menuActive ? '2px' : '0px'});
    }
  }
`;

export const ComPanel = styled.div`
  margin-left: clamp(250px, 20vw, 20vw);
  padding: 20px;
  width: 100%;
  transition: 0.5s cubic-bezier(0.8, 0, 0.2, 1);

  @media (max-width: 1000px) {
    margin-left: 0;
  }
`;

export const ErrorPopup = styled.div<{ $show?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;
  transition: 0.5s;
  z-index: 101;
  animation: ${(props) => props.$show === true ? 'show' : 'hide'} 0.3s forwards;

  & > div {
    position: relative;
    min-height: 40%;
    max-height: 90vh;
    min-width: 60%;
    max-width: 90vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    background-color: #ff373780;
    border-radius: 30px;
    padding: 20px;
    transition: 0.5s;
    transform: ${(props) => props.$show === true ? 'scale(1)' : 'scale(0.5)'};

    & > h1 {
      font-size: 30px;
      font-weight: bold;
      color: #ffcccc;
    }

    & > #close {
      position: absolute;
      top: 20px;
      right: 20px;
      cursor: pointer;
      color: #fff;
      font-size: larger;
      background: #ff000075;
      border-radius: 25%;
    }
  }

  @keyframes show {
    0% { display: flex; opacity: 0; backdrop-filter: blur(0px); background-color: #00000000; }
    100% { display: flex; opacity: 1; backdrop-filter: blur(4px); background-color: #00000080; }
  }
  @keyframes hide {
    0% { display: flex; opacity: 1; backdrop-filter: blur(4px); background-color: #00000080; }
    99% { display: flex; opacity: 0; backdrop-filter: blur(0px); background-color: #00000000; }
    100% { display: none; opacity: 0; backdrop-filter: blur(0px); background-color: #00000000; }
  }
`;

export const TextLimit = styled.div<{ $color?: string, $textbg?: string, $isLimit: boolean }>`
  position: relative;
  width: 100%;

  & > #text {
    position: absolute;
    bottom: -5px;
    right: 0px;
    // border: #aa3939 solid 2px;
    border-radius: 10px 0 10px 10px;
    // box-shadow: #00000080 2px 1px 5px 0px;
    padding: 0px 10px;
    background-color: ${(props) => props.$color || '#9d2f2f'};

    & > span {
      cursor: pointer;
      color: #ff9393;

      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  & > #count {
    position: absolute;
    bottom: 15px;
    right: 15px;
    font-size: 15px;
    font-weight: bold;
    pointer-events: none;
    text-shadow: #000 2px 1px 1px;
    cursor: default;
    padding: 0 5px;
    border-radius: 5px;
    color: ${(props) => props.$isLimit ? '#ff5555' : '#bbb'};
    background-color: ${(props) => props.$textbg || '#c2171770'};
  }
`;

export const AdminLogin = styled.div`
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;

	& > #head {
		position: absolute;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px 0;
		width: 10vw;
		height: 30px;
		box-shadow: 0 5px 10px 0 rgb(0, 0, 0, 0.4);
		min-width: calc(fit-contrgba+ 10px);
		color: rgb(255, 255, 255);
		background-color: rgb(158, 0, 0);
		border: 0px;
		border-radius: 20px;
		font-weight: bold;
		text-align: center;
		top: 0;
		transition: all 1.5s ease-in-out;
	}

	& > #login {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: left;
		flex-wrap: nowrap;
		white-space: nowrap;
		max-height: 0;
		min-height: 0;
		overflow: hidden;
		width: 10vw;
		transition: max-height 0.5s ease-in-out, min-height 0.5s ease-in-out, width 1.5s ease-in-out, opacity 1s ease-in-out;
		background-color: rgb(167, 30, 30);
		border-radius: 20px;
		opacity: 0;
		overflow-y: scroll;

		& > form {
      & > #title {
        margin-top: 70px;
        padding: 10px 40px;
        text-align: left;
        font-size: larger;
        text-align: left;
        width: 80%;
      }

      & > input {
        padding: 10px;
        border-radius: 8px;
        border: none;
        outline: none;
        font-size: 16px;
        color: #fff;
        background: #de1f1f;
        box-shadow: inset 2px 2px 5px 0 rgb(0, 0, 0, 0.4);
        width: 80%;
      }

      & > button {
        margin-top: 10px;
        padding: 10px;
        border-radius: 8px;
        background: rgb(203, 4, 4);
        color: #fff;
        font-weight: bold;
        cursor: pointer;
        border: none;
        transition: background 0.3s;

        &:hover {
          background: rgb(180, 0, 0);
        }
      }

      & > h3 {
        margin: 0;
      }

      & > h4 {
        margin: 0;
        text-align: left;
        width: 80%;
      }
    }
	}

	&:hover {
		& > #head {
			// transform: translateY(-30vh);
			width: 60vw;
			height: 50px;
		}

		& > #login {
			max-height: 80vh;
			min-height: 80vh;
			width: 60vw;
			opacity: 1;
		}
	}
`;
