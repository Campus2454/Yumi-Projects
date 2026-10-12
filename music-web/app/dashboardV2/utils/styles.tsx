import styled from 'styled-components';

export const Page = styled.div`
  & > #sidebar_servers_alert {
    left: calc((var(--spacing) * 16) + 10px);
  }
  & > #sidebar_servers_alert.show {
    left: calc(((var(--spacing) * 16) * 3) + 10px);
  }
`;

export const Sidebar = styled.div`
  --width-hide: calc(var(--spacing) * 16);

  & > #sidebar_menu {
    width: var(--width-hide);
    border-bottom: rgba(255, 255, 255, 0.20) 1px solid;
    transition: border-bottom 0s linear 0.3s;
  }
  & > #sidebar_bar {
    width: var(--width-hide);
    transition: 0.3s ease-in-out;

    & > a {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      padding: 10px 5px;
      border-radius: 10px;
      transition: 0.3s ease-in-out, background-color 0.1s;

      & > svg {
        margin: 0 5px;
        height: 25px;
        width: 25px;
        resize: none;
      }
      & > p {
        width: 0px;
        font-size: calc(var(--spacing) * 2.5);
        font-size: calc(var(--spacing) * 4);
        overflow: hidden;
        white-space: nowrap;
        transition: 0.3s ease-in-out;
      }
    }

    & > .sidebar_active, & > a:hover {
      background-color: #2e2e2e;
    }

    & > #sidebar_servers {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      padding: 10px 5px;
      padding: 5px 5px;
      height: 45px;
      width: 45px;
      border-radius: 10px;
      cursor: pointer;
      transition: 0.3s;

      & > img {
        height: 35px;
        width: 35px;
        border-radius: 50%;
        resize: none;
      }
      & > p {
        width: 0px;
        font-size: calc(var(--spacing) * 2.5);
        font-size: calc(var(--spacing) * 4);
        overflow: hidden;
        padding-left: 5px;
        /* text-align: center; */
        white-space: nowrap;
        transition: 0.3s ease-in-out;
      }

      &:hover {
        background-color: #2e2e2e;
        transition: 0.3s, background-color 0.1s;
      }
    }

    & > #sidebar_playlist {
      opacity: 0;
      pointer-events: none;
      transition: 0.3s;
      & > #newPlaylist {
      }
    }
  }
  &.sidebar_show > #sidebar_bar {
    width: calc(var(--width-hide) * 3);

    & > a {
      width: 100%;

      & > p {
        width: 120px;
      }
    }

    & > #sidebar_servers {
      width: 100%;

      & > p {
        width: 120px;
      }
    }

    & > #sidebar_playlist {
      opacity: 1;
      pointer-events: all;
    }
  }
  &.sidebar_show > #sidebar_menu {
    border-bottom: rgba(255, 255, 255, 0.20) 1px solid;
    transition: border-bottom 0s linear 0s;
  }

  & hr {
    width: 75%;
    margin: 10px calc(25%/2);
  }
`;

export const Player = styled.div`

  & > #player_progressbar {
    position: absolute;
    top: -10px;
    left: 5px;
    width: calc(100% - 10px);
    height: 20px;
    background: linear-gradient(#616161, #616161) center / 100% 2px no-repeat;
    pointer-events: none;
    cursor: pointer;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: calc(100% * var(--position, 0));
      transform: translate(-50%, -50%);

      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #cd2121;

      opacity: 0;
      transition: 0.3s;
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0;
      width: calc(100% * var(--position, 0));
      height: 2px;
      background-color: #cd2121;
      transition: 0.3s;
      pointer-events: none;
    }

    &:hover::before {
      opacity: 1;
      transition: 0s;
    }

    &:hover::after {
      transition: 0s;
    }

    & > #hover_time {
      position: absolute;
      opacity: 0;
      top: -35px;
      background-color: #232323;
      border-radius: 5px;
      padding: 3px 10px;
      left: var(--mouse-position, 0);
      transform: translateX(-50%);
      transition: opacity 0.3s;
      pointer-events: none;

      &::before {
        content: '';
        position: absolute;
        bottom: -0.5rem; /* -left-2 */
        left: 50%;       /* top-1/2 */
        transform: translateX(-50%); /* -translate-y-1/2 */

        border-top: 0.5rem solid #232323; /* border-r-8 + border-r-yellow-800 */
        border-left: 0.5rem solid transparent; /* border-t-8 + transparent */
        border-right: 0.5rem solid transparent; /* border-b-8 + transparent */
      }
    }
    &:hover > #hover_time {
      opacity: 1;
    }

    & > #mouseEvents {
      width: 100%;
      height: 100%;
      overflow: hidden;
      pointer-events: all;

      &.mouseDown {
        position: fixed;
        width: 100vw;
        height: 100vh;
        z-index: 99;
        top: 0;
        left: 0;
        cursor: grabbing;
      }
    }
  }

  & > #player_controller {
    grid-template-columns: repeat(3, minmax(0, 1fr));

    & > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      align-content: center;
      height: 100%;
      min-height: 0;
      color: #d1d1d1;
      gap: 12px;
    }

    & > #player_control_left {
      cursor: pointer;

      & > #image {
        min-width: 54px;
        min-height: 54px;
        max-width: 54px;
        max-height: 54px;
        /* width: 100%;
        height: 100%; */
        position: relative;
        overflow: hidden;
        /* aspect-ratio: 16 / 9; */
        aspect-ratio: 1 / 1;
        background-color: #6e6e6e;
        border-radius: 5px;
        text-align: center;
        align-content: center;

        & > img {
          position: relative;
          display: block;
          z-index: 1;
          width: 100%;
          height: 100%;
          border-radius: 5px;
          object-fit: contain;
          object-fit: cover;
        }

        &::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 0;
          background-image: var(--bg);
          background-size: cover;
          background-position: center;

          filter: blur(5px) brightness(0.4);
          transform: scale(1.3);
        }
      }
      & > #info {
        min-width: 0;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.2;

        & > #name {
          text-overflow: ellipsis;
          /* color: #797979; */
        }

        & > #author {
          color: #797979;
        }
      }
      & > #duration {
        color: #797979;
      }
    }

    & > #player_control_center {
      height: 70%;

      & > div {
        cursor: pointer;
        border-radius: 50%;
        padding: 7px;
        height: 100%;
        aspect-ratio: 1 / 1;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: 0.3s;

        & > svg {
          height: 100%;
          width: 100%;
          display: block;
        }

        &.block {
          cursor: no-drop;
          color: #6e6e6e;
        }

        &:hover:not(.block):not(:active) {
          color: #fff;
          transform: scale(1.1);
        }

        &:active {
          transform: scale(0.8);
        }
      }

      & > #play {
        height: 130%;
        /* background-color: #d1d1d1; */
        /* color: #2a2a2a; */
      }
    }

    & > #player_control_right {
      height: 70%;
      gap: 0px;
      padding-right: 30px;

      & > div {
        cursor: pointer;
        border-radius: 50%;
        padding: 7px;
        height: 100%;
        aspect-ratio: 1 / 1;
        transition: 0.3s;

        & > svg {
          height: 100%;
          width: 100%;
          aspect-ratio: 1 / 1;
          transition: 0.3s;
        }

        &.block {
          cursor: no-drop;
          color: #6e6e6e;
        }

        &:hover:not(.block):not(:active):not(#toggleShow) > svg {
          color: #fff;
          transform: scale(1.1);
        }

        &:active:not(#toggleShow) > svg {
          transform: scale(0.8);
        }
      }

      & > #volume {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: end;
        border-radius: 0;
        /* overflow: hidden; */
        /* cursor: auto; */
        aspect-ratio: 1 / 1;
        /* aspect-ratio: 3 / 1; */

        & > svg {
          /* width: calc(100% / 3); */
          /* cursor: pointer; */
        }

        & > #box {
          position: fixed;
          display: flex;
          /* align-items: flex-start; */
          align-content: center;
          justify-content: center;
          bottom: 90px;
          width: 100px;
          background-color: #232323;
          border-radius: 5px;
          padding: 5px 7px;
          opacity: 0;
          transition: 0.2s;
          pointer-events: none;
          transform: translateX(37px) rotateZ(-90deg);

          & > #bar {
            position: absolute;
            position: relative;
            pointer-events: none;
            /* right: calc(100% / 3); */
            height: 20px;
            /* width: calc((100% / 3) * 2); */
            width: 100%;
            margin: 0 5px;
            background: linear-gradient(#616161, #616161) center / 100% 2px no-repeat;
            pointer-events: none;
            transition: 0.2s;

            &::before {
              content: '';
              position: absolute;
              top: 50%;
              left: calc(100% * calc(var(--volume, 0) / 100));
              transform: translate(-50%, -50%);

              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: var(--bar-color, #cd2121);

              opacity: 1;
              /* transition: 0.3s; */
            }

            &::after {
              content: '';
              position: absolute;
              top: 50%;
              transform: translateY(-50%);
              left: 0;
              width: calc(100% * (var(--volume, 0) / 100));
              height: 2px;
              background: var(--bar-color, #cd2121);
              /* transition: 0.3s; */
              pointer-events: none;
            }

            & > #mouseEvents {
              width: calc(100% + 20px);
              transform: translateX(-10px);
              height: 100%;
              overflow: hidden;
              pointer-events: none;

              &.mouseDown {
                position: fixed;
                width: 100vw;
                height: 100vh;
                width: 100vh;
                height: 100vw;
                transform: translateX(0px);
                z-index: 99;
                top: 0;
                left: 0;
                top: -88.5vw;
                left: -55px;
                cursor: grabbing;
              }
            }
          }

        }

        &:hover > #box, & > #box:hover {
          opacity: 1;
          cursor: pointer;
          pointer-events: all;
          & > #bar > #mouseEvents {
            pointer-events: all;
          }
        }

        &:hover {
          /* aspect-ratio: 3 / 1; */
        }
      }

      & > #toggleShow {
        position: absolute;
        height: calc(100% - 25px);
        aspect-ratio: 1/1;
        margin: 15px;
        padding: 10px;
        right: 0;
        /* border-radius: 0%; */
        /* margin-left: 16px; */
        /* border-left: #474747 1px solid; */

        &:hover {
          background-color: #2a2a2a;
        }
      }
    }

    @media (max-width: 767px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      & > #player_control_center {
        justify-content: flex-end;
      }

      & > #player_control_right {
        display: none;
      }
    }
  }

  & > #player_block {
    opacity: 0;

    &:hover {
      opacity: 1;
    }
  }
`;

export const PopupGuilds = styled.div`
  backdrop-filter: blur(0) brighness(100%);
  opacity: 0;
  pointer-events: none;
  height: 100vh;
  transition: 0.3s ease-in-out;

  &.popupGuildsShow {
    backdrop-filter: blur(4px) brightness(70%);
    opacity: 1;
    pointer-events: all;
  }
`;

export const Home = styled.div`
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 20px;

  & > div {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow-x: hidden;

    & > h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
    }

    & > div {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: 100%;
      overflow-x: hidden;
      position: relative;

      & > .list {
        display: flex;
        flex-direction: row;
        gap: 10px;
        flex-wrap: nowrap;
        scroll-behavior: smooth;
        overflow-x: scroll;
        height: 200px;
        transition: 0.3s;

        &::-webkit-scrollbar {
          display: none;
        }

        & > div {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 20px;
          width: 200px;
          height: 100%;
          border-radius: 10px;
          background-color: #2a2a2a00;
          overflow: hidden;

          & > div#img {
            position: relative;
            width: 100%;
            border-radius: 10px;
            aspect-ratio: 16 / 9;

            & > img {
              width: 100%;
              height: 100%;
              border-radius: 10px;
              aspect-ratio: 16 / 9;
              object-fit: cover;
            }

            & > a#play {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background-color: #00000066;
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              cursor: pointer;
              transition: 0.3s;

              & > svg {
                width: 50px;
                height: 50px;
                color: #ffffffd6;
              }
            }

            &:hover > a#play {
              opacity: 1;
            }
          }

          & > div {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            width: 100%;

            & > h2 {
              min-width: 0;
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 10px;
              color: #fff;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            & > a {
              min-width: 0;
              font-size: 14px;
              color: #797979;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      & > .arrow_left, & > .arrow_right {
        position: absolute;
        height: 100%;
        width: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 0;
        opacity: 0;
        pointer-events: none;
        cursor: pointer;
        z-index: 1;
        transition: 0.3s;

        & > svg {
          width: 50px;
          height: 50px;
          padding: 5px;
          background-color: #2a2a2ab3;
          border-radius: 50%;
          display: block;
          color: #c6c6c6;
          transition: 0.3s;
        }

        &:hover:not(:active) > svg {
          transform: scale(1.1);
          color: #fff;
        }

        &:active > svg {
          transform: scale(0.8);
          color: #fff;
        }
      }

      & > .arrow_left {
        left: 0;
        background: linear-gradient(to right, #09090b, #09090be0, #09090b00);
      }

      & > .arrow_right {
        right: 0;
        background: linear-gradient(to left, #09090b, #09090be0, #09090b00);
      }

    }
  }

  & ~ div > #not_thing {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: 1s;

    & > svg {
      width: 70px;
      height: 70px;
      color: #c2c2c2;
      margin-bottom: 20px;
    }

    & > h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    & > div {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: auto;

      & > p {
        font-size: 14px;
        color: #797979;
      }
    }
  }

  & ~ div > #loading_spiner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 1;
    z-index: -5;
    pointer-events: none;
    transition: 0s;

    & > svg {
      width: 70px;
      height: 70px;
      color: #c2c2c2;
      margin-bottom: 20px;
    }
  }
`;

export const Server = styled.div`
  
`;

export const Search = styled.div`;&{
  height: 100%;
  max-height: auto;

  & > #search-result {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 20px;

    & > a {
      flex-direction: row;
      align-items: flex-start;

      & > .img > img {
        height: 150px;
        aspect-ratio: 16 / 9;
      }

      &:hover {
        background-color: #ffffff27;
      }

      @media (max-width: 640px) {
        flex-direction: column;

        & > .img {
          width: 100%;
          
          & > img {
            width: 100%;
            height: 100%;
            aspect-ratio: 16 / 9;
          }
        }
      }
    }
  }
}`;
