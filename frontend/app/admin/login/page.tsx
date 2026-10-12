'use client';

import { FaDiscord, FaQuestionCircle } from 'react-icons/fa';
import { AdminLogin, BackgroundFixed } from "../../../src/utils/styles";
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminLoginPage() {
  const [auth, setAuth] = useState(false);
  const [code, setCode] = useState('');
  const [shellRes, setShellRes] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [axiosConfig, setAxiosConfig] = useState({});
  const [ulogin, setULogin] = useState<string>('');
  const [plogin, setPLogin] = useState<string>('');

  const login = async () => {
    // const u = prompt('username?');
    // const p = prompt('password?');
    // const token = btoa(`${u}:${p}`);
    const token = btoa(`${ulogin}:${plogin}`);
    const config = {
      headers: {
        Authorization: `Basic ${token}`
      },
      withCredentials: true
    };
    try {
      await axios.get('/api/login', config);
      setAxiosConfig(config);
      setAuth(true);
    } catch (err) {
      alert('fail login');
    }
  };

  const runShell = async () => {
    try {
      const { data } = await axios.post('/api/shell', { code }, axiosConfig);
      setShellRes(data.error ? `Error: ${data.error}` : JSON.stringify(data.result, null, 2));
    } catch (err) {
      setShellRes('❌ Request error');
    }
  };

  const loadPlayers = async () => {
    try {
      const { data } = await axios.get('/api/players', axiosConfig);
      setPlayers(data);
    } catch (err) {
      console.warn('loadPlayers error', err);
    }
  };

  const control = async (guildId: string, action: string) => {
    try {
      await axios.post('/api/control', { guildId, action }, axiosConfig);
      await loadPlayers();
    } catch (err) {
      alert('control failed');
    }
  };

  useEffect(() => {
    if (auth) loadPlayers();
  }, [auth]);

	return (<div className="page" style={{ position: 'fixed', top: 0, left: 0, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Kanit' }}>
		<BackgroundFixed id="background" />
		{(()=>{if(!auth){return(
			<AdminLogin>
				<div id='head'>Login</div>
				<div id='login'>
					<form id='login' onSubmit={(e) => { e.preventDefault(); login(); }}>
						<h3 id='title'>Enter your username and password.</h3>
						
						<h4>Username</h4>
						<input type="text" onChange={u => setULogin(u.target.value)} name="username" />

						<h4>Password</h4>
						<input type="password" onChange={p => setPLogin(p.target.value)} name="password" />

						<button type="submit">Continue</button>
					</form>
				</div>
			</AdminLogin>
		)}else return(
			<AdminPanel
				code={code}
				setCode={setCode}
				shellRes={shellRes}
				runShell={runShell}
				players={players}
				control={control}
				loadPlayers={loadPlayers}
			/>
		)})()}
	</div>);
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: '#1a0000',
    color: '#ff4d4d',
    fontFamily: 'monospace',
    padding: 20,
    minHeight: '100vh',
		width: '100vw',
		overflowY: 'scroll',
  },
  sectionTitle: {
    borderBottom: '1px solid #ff4d4d',
    marginBottom: 10,
    paddingBottom: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textarea: {
    background: '#330000',
    color: '#ffcccc',
    border: '1px solid #ff4d4d',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
		resize: 'none',
  },
  button: {
    background: '#ff1a1a',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: 4,
    cursor: 'pointer',
    margin: '5px 5px 10px 0',
		width: 'fit-content',
  },
  playerBox: {
    border: '1px solid #ff4d4d',
    background: '#220000',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  refreshIcon: {
    cursor: 'pointer',
    fontSize: 18,
    padding: '0 5px',
  },
};

function AdminPanel({
  code,
  setCode,
  shellRes,
  runShell,
  players,
  control,
  loadPlayers,
}: any) {
  return (
    <div style={styles.container}>
      <div style={{ padding: 20, }}><div style={styles.sectionTitle}>
        <h2>Shell</h2>
      </div>

			<div style={{ display: 'flex', flexDirection: 'column', }}>
				<textarea
					rows={5}
					value={code}
					onChange={(e) => setCode(e.target.value)}
					style={styles.textarea}
					placeholder="Enter shell command..."
				/>
				<button onClick={runShell} style={styles.button}>Run</button>
			</div>

      <pre>{shellRes}</pre>

      <div style={styles.sectionTitle}>
        <h2>Players</h2>
        <span style={styles.refreshIcon} onClick={loadPlayers}>🔄</span>
      </div>

      {players.map((p: any) => (
        <div key={p.guildId} style={styles.playerBox}>
          <div><b>Guild:</b> {p.guildId}</div>
          <div>
            <b>State:</b>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(p.state, null, 2)}
            </pre>
          </div>
          {['pause', 'resume', 'stop', 'destroy'].map((a) => (
            <button key={a} onClick={() => control(p.guildId, a)} style={styles.button}>
              {a}
            </button>
          ))}
        </div>
      ))}</div>
    </div>
  );
};

