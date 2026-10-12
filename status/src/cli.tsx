import React, { useState, useEffect, JSX } from 'react';
import { render, Box, Text, useStdout } from 'ink';
import pm2 from 'pm2';
import chalk from 'chalk';

// ---------- Types ----------
type PM2Process = {
  pm_id: number;
  name: string;
  pid: number;
  monit: {
    cpu: number;
    memory: number;
  };
  pm2_env: {
    status: string;
    restart_time: number;
  };
};

// export class monitor {
export async function monitor(target?: string) {
// (async () => {

if (!target) {
  console.error(
    `${chalk.redBright('Usage Error')}: Missing required argument

Usage:
  monitor <name|id>

Example:
  $ monitor Camming
  $ monitor 0

Options:
  <name|id>   Process name or PM2 ID to monitor`
  );
  process.exit(1);
}

// ---------- UI Component ----------
const Monitor = ({
  logs,
  pm2_process,
  Logs_,
}: {
  logs: string[];
  pm2_process?: PM2Process;
  Logs_: () => JSX.Element;
}) => {
  const { stdout } = useStdout();
  const [termWidth, setTermWidth] = useState(stdout.columns || 80);
  const [termHeight, setTermHeight] = useState(stdout.rows || 30);

  useEffect(() => {
    const onResize = () => {
      setTermWidth(stdout.columns || 80);
      setTermHeight(stdout.rows || 30);
    };
    stdout.on('resize', onResize);
    return () => {
      stdout.off('resize', onResize);
    };
  }, [stdout]);

  // กำหนดความสูงของ log box แบบเหลือพื้นที่จาก header
  const headerHeight = 3; // ช่วงชื่อ + info process
  const infoHeight = 1; // ข้อมูล process info
  const logBoxHeight = termHeight - headerHeight - infoHeight - 4; // 4 เผื่อ padding/กรอบ
  const usableHeight = Math.max(termHeight - 1, 10);

  return (
    <Box
      flexDirection="column"
      width={termWidth}
      height={termHeight}
      padding={0} // ปิด padding
      margin={0}
      borderStyle="round"
      borderColor="cyan"
    >
      <Box justifyContent="space-between" marginBottom={1}>
        <Text bold>PM2 Monitor - {pm2_process?.name || 'null'}</Text>
        <Text>{new Date().toLocaleTimeString()}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1} height={infoHeight} overflow="hidden">
        {pm2_process ? (
          <Text key={pm2_process.pm_id}>
            {`[${pm2_process.pm_id}] ${pm2_process.name} | PID: ${pm2_process.pid} | CPU: ${pm2_process.monit.cpu.toFixed(
              1
            )}% | MEM: ${(pm2_process.monit.memory / 1024 / 1024).toFixed(
              1
            )} MB | Restarts: ${pm2_process.pm2_env.restart_time} | Status: ${
              pm2_process.pm2_env.status
            }`}
          </Text>
        ) : null}
      </Box>

      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor="cyan"
        // padding={1}
        height={logBoxHeight}
        overflow="hidden"
        flexGrow={1}
      >
        {/* {logs.flatMap((line, i) =>
          line.split('\n').map((subLine, j) => (
            <Text key={`${i}-${j}`}>{subLine}</Text>
          ))
        )} */}
        {/* {logs.map((l, i)=><Text key={`${i}`}>{l}</Text>)} */}
        <Logs_ />
      </Box>
    </Box>
  );
};

// ---------- Main Logic ----------
let interval: NodeJS.Timeout;
let bus: any;
let logs: string[] = [];
let pm2_process: PM2Process | undefined;

const App = () => {
  const [stateLogs, setStateLogs] = useState<string[]>([]);
  const [stateProcess, setStateProcess] = useState<PM2Process | undefined>(
    undefined
  );

  useEffect(() => {
    pm2.connect((err) => {
      if (err) {
        console.error('PM2 connect error:', err);
        process.exit(2);
      }

      const updatepm2_Process = () => {
        pm2.list((err, list) => {
          if (!err) {
            const p = list.find(
              (p) =>
                p.pm_id?.toString() === target || p.name === target
            ) as PM2Process | undefined;
            setStateProcess(p);
          }
        });
      };

      updatepm2_Process();
      interval = setInterval(updatepm2_Process, 100);

      pm2.launchBus((err, _bus) => {
        if (err) {
          console.error('PM2 launchBus error:', err);
          return;
        }

        bus = _bus;

        bus.on('log:out', (data: any) => {
          if (
            data.process.name === target ||
            String(data.process.pm_id) === target
          ) {
            logs = [...logs.slice(-300), data.data.trimEnd()];
            setStateLogs(logs);
          }
        });

        bus.on('log:err', (data: any) => {
          if (
            data.process.name === target ||
            String(data.process.pm_id) === target
          ) {
            logs = [...logs.slice(-300), `ERR: ${data.data.trimEnd()}`];
            setStateLogs(logs);
          }
        });

        if (process.stdin.isTTY) {
          process.stdin.setRawMode(true);
          process.stdin.resume();

          const onData = (data: Buffer) => {
            if (data.length === 1 && data[0] === 3) {
              cleanupAndExit();
            }
          };
          process.stdin.on('data', onData);

          const cleanupAndExit = () => {
            clearInterval(interval);
            bus.close();
            pm2.disconnect();

            process.stdin.setRawMode(false);
            process.stdin.pause();
            process.stdin.removeListener('data', onData);

            // unmount UI and exit
            process.exit(0);
          };

          process.on('SIGINT', cleanupAndExit);
          process.on('SIGTERM', cleanupAndExit);
        }
      });
    });

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      if (bus) bus.close();
      pm2.disconnect();
    };
  }, []);

  let ll = () => {
    return(<></>);
  };

  useEffect(()=>{
    setTimeout(() => {
      ll = () => {
        return(<>
          {stateLogs.map((l, i)=>{return <Text key={i}>{l}</Text>})}
        </>)
      };
      // stateLogs.map((l)=>console.log(l));
      // console.log(ll());
      console.log(stateLogs);
    }, 200);
  }, [stateLogs]);


  return <Monitor logs={stateLogs} pm2_process={stateProcess} Logs_={ll} />;
  return <></>
};

render(<App />);

// })()
}
// };
