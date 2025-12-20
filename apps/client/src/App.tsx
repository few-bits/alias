import { useEffect, useMemo, useState } from 'react';
import {
  Rocket,
  Settings,
  Trophy,
  Clock3,
  Volume2,
  VolumeX,
  PauseCircle,
  Play,
  CheckCircle2,
  XCircle,
  Crown,
  PlugZap,
  Plus,
  Shuffle,
  Megaphone,
  Ear,
  LogOut,
  UserMinus,
  LogIn,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Toaster, toast } from 'react-hot-toast';
import { useGameStore, TEAM_THEMES } from './store/gameStore';
import type { GameStateClient, GameStateActions } from './store/gameStore';
import type {
  Player,
  Team,
  Mode,
  Settings as AliasSettings,
} from '@alias/shared';
import { soundManager } from './utils/soundManager';
import './index.css';

// --- Helper Components ---
const AccentButton = ({ onClick, children, disabled, className = '' }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`btn-glass btn-accent flex items-center justify-center gap-2 ${className}`}
  >
    {children}
  </button>
);

const Tile = ({ title, children, rightElement }: any) => (
  <div className="glass-panel p-4 md:p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {rightElement}
    </div>
    {children}
  </div>
);

const PlayerTable = ({
  players,
  selfId,
  isHost,
  onToggleReady,
  onKick,
  gameStage,
}: any) => (
  <div className="overflow-hidden rounded-xl border border-white/5 bg-black/10">
    <table className="min-w-full text-sm text-gray-300">
      <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-400">
        <tr>
          <th className="px-4 py-3 text-left">Имя</th>
          <th className="px-4 py-3 text-left">Очки</th>
          <th className="px-4 py-3 text-left">Статус</th>
          {isHost && <th className="px-4 py-3 text-right"></th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {players.map((p: Player) => (
          <tr key={p.id} className="hover:bg-white/10 transition">
            <td className="px-4 py-3 font-semibold text-white">
              <div className="flex items-center gap-2">
                {p.isHost && <Crown className="h-4 w-4 text-amber-400" />}
                <span>{p.name}</span>
                {p.id === selfId && (
                  <span className="badge bg-white/20 border-white/30 text-xs">
                    Вы
                  </span>
                )}
                {!p.online && (
                  <span className="text-[10px] text-red-400 ml-1">
                    (offline)
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3 font-mono">{p.score}</td>
            <td className="px-4 py-3">
              {gameStage === 'lobby' ? (
                <button
                  onClick={() => onToggleReady?.(p.id)}
                  disabled={p.id !== selfId}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                    p.ready
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-white/10 text-gray-400 border border-white/10'
                  } ${p.id !== selfId ? 'cursor-default opacity-80' : 'hover:bg-opacity-80'}`}
                >
                  {p.ready ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {p.ready ? 'Готов' : 'Не готов'}
                </button>
              ) : (
                <span className="text-xs text-gray-400">В игре</span>
              )}
            </td>
            {isHost && (
              <td className="px-4 py-3 text-right">
                {!p.isHost && (
                  <button
                    onClick={() => {
                      if (confirm(`Исключить игрока ${p.name}?`))
                        onKick?.(p.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                    title="Исключить"
                  >
                    <UserMinus className="h-4 w-4" />
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const TeamsSection = ({
  teams,
  players,
  selfId,
  onCreateTeam,
  onJoinTeam,
  isHost,
}: any) => {
  const getTeamPlayers = (teamId: string) =>
    players.filter((p: Player) => p.teamId === teamId);
  const getTeamScore = (team: Team) =>
    getTeamPlayers(team.id).reduce(
      (sum: number, p: Player) => sum + p.score,
      0,
    );
  const currentPlayerTeam = players.find(
    (p: Player) => p.id === selfId,
  )?.teamId;

  return (
    <div className="space-y-3">
      {teams.map((team: Team) => {
        const teamPlayers = getTeamPlayers(team.id);
        const theme = TEAM_THEMES[team.themeIndex % TEAM_THEMES.length];
        const isCurrentTeam = currentPlayerTeam === team.id;
        const teamScore = getTeamScore(team);

        return (
          <div
            key={team.id}
            className={`glass-panel p-4 border ${theme.border} ${theme.bg} relative transition-transform hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className={`text-lg font-bold ${theme.text}`}>
                  {team.name}
                </h4>
                <p className={`text-sm font-bold opacity-70 ${theme.text}`}>
                  {teamScore} очк.
                </p>
              </div>
              <button
                onClick={() => onJoinTeam(team.id)}
                disabled={isCurrentTeam}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition btn-glass ${
                  isCurrentTeam
                    ? `${theme.bg} border ${theme.border} ${theme.text} opacity-100`
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {isCurrentTeam ? 'Ваша команда' : 'Вступить'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamPlayers.map((p: Player) => (
                <span
                  key={p.id}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-black/20 text-white/90 border border-white/10`}
                >
                  {p.name}
                </span>
              ))}
              {teamPlayers.length === 0 && (
                <span className="text-xs italic opacity-50">Пусто</span>
              )}
            </div>
          </div>
        );
      })}
      {isHost && (
        <button
          onClick={onCreateTeam}
          className="w-full btn-glass border-dashed border-white/30 text-gray-400 hover:border-accent-main hover:text-accent-main transition flex items-center justify-center gap-2 py-3"
        >
          <Plus className="h-4 w-4" /> Создать команду
        </button>
      )}
    </div>
  );
};

// --- Screen Components ---

const LoginScreen = () => {
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const { actions, user } = useGameStore();

  useEffect(() => {
    if (user?.username || user?.name) {
      setName(user.username || user.name || '');
    }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomFromUrl = params.get('room');
    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      toast.success('Код комнаты введен!');
    }
  }, []);

  return (
    <div className="max-w-xl mx-auto pt-10 px-4 animate-fade-in">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-accent-main/40 blur-3xl rounded-full opacity-50"></div>
          <img
            src="/logo.jpg"
            alt="Logo"
            className="relative h-24 w-24 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          />
        </div>
        <div>
          {/* 🔥 ПРАВКА: Название и Слоган */}
          <h1 className="text-5xl font-black tracking-tight text-white mb-2">
            SeaBornAlias
          </h1>
          <p className="text-gray-400 text-lg">Будущие бывшие друзья</p>
        </div>

        <div className="glass-panel w-full p-8 space-y-8">
          <div className="flex flex-col gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={`${user.avatar}`}
                      className="h-10 w-10 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-accent-main flex items-center justify-center font-bold">
                      {user.username?.[0] || 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">
                      {user.username || user.name}
                    </div>
                    <div className="text-xs text-green-400">Онлайн</div>
                  </div>
                </div>
                <button
                  onClick={() => actions.logout()}
                  className="text-xs text-gray-400 hover:text-white underline"
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 uppercase font-bold text-left mb-1">
                  Войти через:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => actions.loginWithProvider('google')}
                    className="flex items-center justify-center gap-2 p-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-gray-100 transition"
                  >
                    Google
                  </button>
                  <button
                    onClick={() => actions.loginWithProvider('discord')}
                    className="flex items-center justify-center gap-2 p-2 rounded-lg bg-[#5865F2] text-white font-bold text-sm hover:bg-[#4752C4] transition"
                  >
                    Discord
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-left">
            <label className="text-xs font-bold uppercase text-gray-500 ml-1 mb-1 block">
              Ваше имя в игре
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Как вас зовут?"
              className="input-glass w-full text-lg"
              maxLength={12}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 hidden md:block" />

            {/* 🔥 ПРАВКА: Центрирование кнопок */}
            <div className="flex flex-col gap-3 items-center text-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase">
                Новая игра
              </h3>
              <AccentButton
                onClick={() => actions.createRoom(name)}
                disabled={!name}
                className="h-12 w-full"
              >
                <PlugZap className="h-5 w-5" /> Создать
              </AccentButton>
            </div>

            {/* 🔥 ПРАВКА: Центрирование кнопок */}
            <div className="flex flex-col gap-3 items-center text-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase">
                Присоединиться
              </h3>
              <div className="flex gap-2 w-full">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="1234"
                  className="input-glass w-full h-12 text-center font-mono tracking-widest text-xl"
                  maxLength={4}
                />
                <button
                  onClick={() => actions.joinRoom(name, roomId)}
                  disabled={!name || !roomId}
                  className="btn-glass px-4 bg-white/10 hover:bg-white/20 disabled:opacity-50"
                >
                  <LogIn className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LobbyScreen = ({
  settings,
  players,
  teams,
  isHost,
  selfId,
  roomId,
  actions,
  customWords,
  customTopic,
}: {
  settings: AliasSettings;
  players: Player[];
  teams: Team[];
} & Pick<
  GameStateClient,
  'isHost' | 'selfId' | 'roomId' | 'customWords' | 'customTopic'
> &
  GameStateActions) => {
  const [topic, setTopic] = useState('');
  const isTeamMode = settings.mode === 'team';
  const canStartGame =
    players.length >= 2 &&
    (!isTeamMode ||
      teams.filter((t: Team) => t.playerIds.length >= 2).length >= 2);
  const teamValidationError =
    isTeamMode &&
    teams.some((t: Team) => t.playerIds.length > 0 && t.playerIds.length < 2);
  const displayRoomId = roomId?.replace('alias-', '') || '...';

  const gameModes: { value: Mode; label: string }[] = [
    { value: 'team', label: 'Команды' },
    { value: 'solo_standard', label: 'Соло (Std)' },
    { value: 'solo_all_vs_all', label: 'Соло (All)' },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6 animate-fade-in">
      <div className="glass-panel p-5 space-y-6 h-fit">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase font-bold">
              Код комнаты
            </p>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-mono font-black text-accent-main tracking-widest mt-1 select-all">
                {displayRoomId}
              </h2>
              {isHost && (
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?room=${displayRoomId}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Ссылка скопирована!');
                  }}
                  className="p-2 mt-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10"
                >
                  <Share2 className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
          <Settings className="h-6 w-6 text-gray-400" />
        </div>

        {isHost && (
          <div className="glass-panel bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-accent-main/30 p-4 -mx-5 -mt-2">
            <div className="flex items-center gap-2 mb-2 text-accent-main font-bold text-sm uppercase">
              <Sparkles className="h-4 w-4" /> AI Генератор слов
            </div>
            {customWords ? (
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm">
                  <span className="text-gray-400">Тема: </span>
                  <span className="text-white font-bold">{customTopic}</span>
                  <div className="text-xs text-green-400 mt-1">
                    Загружено {customWords.length} слов
                  </div>
                </div>
                <button
                  onClick={actions.clearCustomWords}
                  className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Напр: Гарри Поттер"
                  className="input-glass text-sm w-full"
                />
                {/* 🔥 AI пока заглушка - не скрываю, но будет работать потом */}
                <button
                  onClick={() => {
                    if (!topic) return toast.error('Введите тему');
                    actions.generateWordsAI(topic);
                  }}
                  className="btn-glass bg-accent-main/20 hover:bg-accent-main/40 border-accent-main/50"
                  disabled={!topic}
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 pt-2 border-t border-white/10">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Режим игры
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {gameModes.map((mode) => (
                <button
                  key={mode.value}
                  disabled={!isHost}
                  onClick={() =>
                    actions.updateSettings({ mode: mode.value as any })
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${settings.mode === mode.value ? 'border-accent-main bg-accent-main/20 text-white' : 'border-white/10 bg-white/5 text-gray-400'} ${!isHost && 'opacity-70 cursor-not-allowed'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Сложность
            </label>
            <select
              disabled={!isHost}
              value={settings.difficulty}
              onChange={(e) =>
                actions.updateSettings({ difficulty: e.target.value as any })
              }
              className="input-glass w-full text-sm"
            >
              <option value="easy" className="text-black">
                Легко
              </option>
              <option value="medium" className="text-black">
                Средне
              </option>
              <option value="hard" className="text-black">
                Сложно
              </option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Время (сек)
              </label>
              <input
                type="number"
                value={settings.roundTime}
                disabled={!isHost}
                onChange={(e) =>
                  actions.updateSettings({ roundTime: Number(e.target.value) })
                }
                className="input-glass w-full text-center font-mono"
                min={10}
                max={300}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Цель (очки)
              </label>
              <input
                type="number"
                value={settings.winScore}
                disabled={!isHost}
                onChange={(e) =>
                  actions.updateSettings({ winScore: Number(e.target.value) })
                }
                className="input-glass w-full text-center font-mono"
                min={10}
                max={200}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2 border-t border-white/10">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Усложнения раунда
            </label>
            <div className="mt-2">
              <button
                disabled={!isHost}
                onClick={() =>
                  actions.updateSettings({
                    enableChallenges: !settings.enableChallenges,
                  })
                }
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition w-full ${settings.enableChallenges ? 'border-rose-500 bg-rose-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400'} ${!isHost && 'opacity-70 cursor-not-allowed'}`}
              >
                {settings.enableChallenges ? 'Включены' : 'Выключены'}
              </button>
            </div>
          </div>
        </div>

        {isHost && (
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={actions.shuffleTeams}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
            >
              <Shuffle className="h-4 w-4" /> Перемешать
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {settings.mode === 'team' && (
          <Tile title="Команды">
            <TeamsSection
              teams={teams}
              players={players}
              selfId={selfId}
              onCreateTeam={() => actions.createTeam()}
              onJoinTeam={(id: string) => actions.joinTeam(id)}
              isHost={isHost}
            />
            {teamValidationError && (
              <div className="mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4" /> В каждой команде должно быть
                минимум 2 игрока
              </div>
            )}
          </Tile>
        )}

        <Tile
          title="Список игроков"
          rightElement={
            <div className="text-xs font-mono bg-white/10 px-2 py-1 rounded">
              {players.length} / 8
            </div>
          }
        >
          <PlayerTable
            players={players}
            selfId={selfId}
            isHost={isHost}
            onToggleReady={actions.toggleReady}
            onKick={actions.kickPlayer}
            gameStage="lobby"
          />
        </Tile>

        <div className="flex justify-end pt-2">
          {isHost ? (
            <div className="flex flex-col items-end gap-3">
              {!canStartGame && (
                <div className="text-right">
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-1">
                    Нельзя начать игру
                  </p>
                  <p className="text-sm text-gray-400">
                    {players.length < 2
                      ? 'Нужно минимум 2 игрока'
                      : isTeamMode
                        ? 'Минимум две команды должны иметь по ≥ 2 игрока'
                        : 'Готово к старту!'}
                  </p>
                </div>
              )}
              <AccentButton
                onClick={() => {
                  if (!canStartGame) {
                    toast.error('Соберите команды!');
                    return;
                  }
                  soundManager.play('start');
                  actions.startGame();
                }}
                disabled={!canStartGame}
                className={`px-8 py-3 text-lg ${!canStartGame ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                <Play className="h-6 w-6 fill-current" /> Начать игру
              </AccentButton>
            </div>
          ) : (
            <div className="text-gray-400 italic animate-pulse">
              Ожидание хоста...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PreRoundScreen = ({
  speaker,
  listener,
  currentTeamId,
  teams,
  players,
  settings,
  selfId,
  // isHost,
  actions,
  readyMap,
  activeChallenge,
}: any) => {
  const currentTeam = teams.find((t: Team) => t.id === currentTeamId);
  const teamTheme = currentTeam
    ? TEAM_THEMES[currentTeam.themeIndex % TEAM_THEMES.length]
    : null;
  const isSpeaker = selfId === speaker?.id;
  const isListener = selfId === listener?.id;
  const amIInvolved = isSpeaker || isListener;
  const isSpeakerReady = !!readyMap[speaker?.id || ''];
  const isListenerReady = !!readyMap[listener?.id || ''];
  const requiredReady = isSpeakerReady && isListenerReady;
  const showStartButton = isSpeaker && requiredReady;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,300px] gap-6 animate-fade-in">
      <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        {teamTheme && (
          <div className={`absolute inset-0 opacity-10 ${teamTheme.bg}`} />
        )}
        <div className="relative z-10 w-full max-w-lg text-center space-y-8">
          <div>
            <div className="badge mb-2">
              Раунд #{useGameStore.getState().round.roundNumber}
            </div>
            <h2 className="text-3xl font-bold text-white">Приготовьтесь!</h2>
            {settings.mode === 'team' && currentTeam && (
              <p className={`text-xl font-bold mt-2 ${teamTheme?.text}`}>
                Ход команды: {currentTeam.name}
              </p>
            )}
          </div>

          {activeChallenge && (
            <div className="mt-4 p-4 border-2 border-rose-500/50 bg-rose-500/10 rounded-xl shadow-lg animate-pulse">
              <p className="text-sm font-black text-rose-300 uppercase">
                🔥 УСЛОЖНЕНИЕ РАУНДА!
              </p>
              <p className="text-xl font-bold text-white mt-1">
                {activeChallenge}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 rounded-full bg-accent-main/20 border-2 border-accent-main flex items-center justify-center relative">
                <Megaphone className="h-8 w-8 text-accent-main" />
                {isSpeakerReady && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase font-bold">
                  Объясняет
                </p>
                <p className="text-lg font-bold text-white">{speaker?.name}</p>
              </div>
            </div>
            <div className="h-px w-16 bg-white/20" />
            <div className="flex flex-col items-center gap-2">
              <div className="h-20 w-20 rounded-full bg-indigo-500/20 border-2 border-indigo-500 flex items-center justify-center relative">
                <Ear className="h-8 w-8 text-indigo-400" />
                {isListenerReady && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase font-bold">
                  Отгадывает
                </p>
                <p className="text-lg font-bold text-white">{listener?.name}</p>
              </div>
            </div>
          </div>

          <div className="pt-6">
            {amIInvolved ? (
              !requiredReady ? (
                <button
                  onClick={() => {
                    soundManager.play('click');
                    actions.markRoundReady(selfId!, !readyMap[selfId!]);
                  }}
                  className={`w-full py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95 ${readyMap[selfId!] ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'}`}
                >
                  {readyMap[selfId!] ? 'ОЖИДАНИЕ ПАРТНЕРА' : 'Я ГОТОВ!'}
                </button>
              ) : // 🔥 ПРАВКА: Убран network.sendToHost, теперь actions.startGameRound/emit
              showStartButton ? (
                <button
                  onClick={() => {
                    soundManager.play('start');
                    actions.startGameRound();
                  }}
                  className="w-full py-4 rounded-xl text-xl font-bold bg-accent-main hover:bg-accent-main/80 text-white shadow-[0_0_20px_rgba(var(--accent-main),0.4)] animate-pulse"
                >
                  ПОЕХАЛИ!
                </button>
              ) : (
                <div className="text-gray-400">
                  Ждем запуска раунда объясняющим...
                </div>
              )
            ) : (
              <div className="p-4 bg-black/20 rounded-lg text-gray-400">
                Вы наблюдаете за этим раундом
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Tile title="Счет">
          <div className="space-y-2">
            {settings.mode === 'team'
              ? teams.map((t: Team) => {
                  const theme = TEAM_THEMES[t.themeIndex % TEAM_THEMES.length];
                  const playersInTeam = players.filter(
                    (p: Player) => p.teamId === t.id,
                  );
                  const score = playersInTeam.reduce(
                    (acc: number, p: Player) => acc + p.score,
                    0,
                  );
                  return (
                    <div
                      key={t.id}
                      className={`flex justify-between p-2 rounded border ${theme.border} ${theme.bg}`}
                    >
                      <span className={theme.text}>{t.name}</span>
                      <span className="font-bold text-white">{score}</span>
                    </div>
                  );
                })
              : players
                  .sort((a: Player, b: Player) => b.score - a.score)
                  .map((p: Player) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center p-2 border-b border-white/5 last:border-0"
                    >
                      <span className="text-gray-300">{p.name}</span>
                      <span className="font-bold text-white">{p.score}</span>
                    </div>
                  ))}
          </div>
        </Tile>
      </div>
    </div>
  );
};

const GameScreen = ({
  speaker,
  listener,
  timeLeft,
  word,
  // isHost,
  selfId,
  isPaused,
  currentTeamId,
  actions,
}: any) => {
  const { players, settings, teams, round } = useGameStore();
  const { activeChallenge } = round;
  const isSpeaker = speaker?.id === selfId;
  const isListener = listener?.id === selfId;

  // 🔥 ПРАВКА: Все actions идут через стор (P2P удален)
  const handleCorrect = () => {
    soundManager.play('correct');
    actions.handleCorrect();
  };
  const handleSkip = () => {
    soundManager.play('skip');
    actions.handleSkip();
  };
  const handlePause = () => {
    actions.togglePause();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6 animate-fade-in h-full">
      <div className="glass-panel p-8 flex flex-col relative overflow-hidden min-h-[500px]">
        <div className="flex justify-between items-start z-10">
          <div className="badge bg-red-500/20 text-red-200 border-red-500/30 flex items-center gap-2 px-3 py-1">
            <Clock3 className="h-4 w-4" />
            <span className="font-mono text-xl font-bold">{timeLeft}s</span>
          </div>
          <button onClick={handlePause} className="btn-glass p-2 rounded-full">
            {isPaused ? (
              <Play className="h-6 w-6" />
            ) : (
              <PauseCircle className="h-6 w-6" />
            )}
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center z-10 py-10">
          {activeChallenge && (
            <div className="mb-4 text-center p-3 border-2 border-rose-500/50 bg-rose-500/10 rounded-xl shadow-lg">
              <p className="text-sm font-black text-rose-300 uppercase">
                🔥 ЗАДАНИЕ:
              </p>
              <p className="text-lg font-bold text-white mt-1">
                {activeChallenge}
              </p>
            </div>
          )}
          {isSpeaker ? (
            <>
              <div className="text-sm text-gray-400 uppercase tracking-[0.2em] mb-4">
                Ваше слово
              </div>
              <div className="text-5xl md:text-7xl font-black text-white text-center break-words leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {word}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm text-gray-400 uppercase tracking-[0.2em] mb-4">
                {isListener ? 'Вы отгадываете' : 'Наблюдатель'}
              </div>
              <div className="text-3xl font-bold text-gray-300 text-center opacity-50">
                {isListener
                  ? 'Слушайте внимательно!'
                  : `${speaker?.name} объясняет...`}
              </div>
            </>
          )}
        </div>

        {isSpeaker && (
          <div className="grid grid-cols-2 gap-4 z-10 mt-auto">
            <button
              onClick={handleSkip}
              className="h-20 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xl hover:bg-red-500/20 active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <XCircle className="h-6 w-6 mb-1" />
              Пропустить (-1)
            </button>
            <button
              onClick={handleCorrect}
              className="h-20 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-xl hover:bg-green-500/20 active:scale-95 transition-all flex flex-col items-center justify-center"
            >
              <CheckCircle2 className="h-6 w-6 mb-1" />
              Угадал (+1)
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 flex items-center justify-between">
          <span className="text-gray-400">Объясняет</span>
          <span className="font-bold text-white">{speaker?.name}</span>
        </div>
        <div className="glass-panel p-4 flex items-center justify-between">
          <span className="text-gray-400">Отгадывает</span>
          <span className="font-bold text-white">{listener?.name}</span>
        </div>

        <div className="glass-panel p-4 flex-1">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" /> Лидерборд
          </h3>
          <div className="space-y-3">
            {settings.mode === 'team'
              ? teams
                  .sort((a: Team, b: Team) => b.score - a.score)
                  .map((t: Team) => {
                    const teamPlayers = players.filter(
                      (p: Player) => p.teamId === t.id,
                    );
                    const score = teamPlayers.reduce(
                      (acc: number, p: Player) => acc + p.score,
                      0,
                    );
                    const theme =
                      TEAM_THEMES[t.themeIndex % TEAM_THEMES.length];
                    const isActive = t.id === currentTeamId;
                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-lg border ${theme.border} ${theme.bg} ${isActive ? 'ring-2 ring-white' : ''} flex flex-col`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={theme.text}>{t.name}</span>
                          <span className="font-bold text-white text-lg">
                            {score}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {teamPlayers.map((p: Player) => (
                            <span
                              key={p.id}
                              className="text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-gray-300 flex gap-1"
                            >
                              {p.name}:{' '}
                              <span
                                className={
                                  p.score < 0 ? 'text-red-400' : 'text-gray-300'
                                }
                              >
                                {p.score}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
              : players
                  .slice()
                  .sort((a: Player, b: Player) => b.score - a.score)
                  .map((p: Player) => (
                    <div
                      key={p.id}
                      className={`flex justify-between items-center p-2 border-b border-white/5 last:border-0 ${p.id === speaker?.id ? 'bg-white/5 rounded' : ''}`}
                    >
                      <span
                        className={`text-sm ${p.id === speaker?.id ? 'text-accent-main font-bold' : 'text-gray-300'}`}
                      >
                        {p.name} {p.id === selfId && '(Вы)'}
                      </span>
                      <span
                        className={`font-mono font-bold ${p.score < 0 ? 'text-red-400' : 'text-white'}`}
                      >
                        {p.score}
                      </span>
                    </div>
                  ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const VictoryScreen = ({ winner, players, onRestart }: any) => {
  useEffect(() => {
    soundManager.play('win');
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;
    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        }),
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        }),
      );
    }, 250);
    return () => clearInterval(interval);
  }, []);
  const bestSpeaker = [...players].sort(
    (a: Player, b: Player) => b.explained - a.explained,
  )[0];
  const bestGuesser = [...players].sort(
    (a: Player, b: Player) => b.guessed - a.guessed,
  )[0];

  return (
    <div className="max-w-4xl mx-auto pt-10 animate-fade-in text-center px-4">
      <div className="glass-panel p-10 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
        <div className="inline-flex p-4 rounded-full bg-amber-500/20 mb-6">
          <Crown className="h-16 w-16 text-amber-400" />
        </div>
        <h2 className="text-6xl font-black text-white mb-2 uppercase tracking-tight">
          Победа!
        </h2>
        <p className="text-2xl text-amber-200 mb-10 font-bold">
          {(winner as any)?.name || 'Неизвестный'} забирает кубок!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm uppercase font-bold mb-2">
              Оратор от бога
            </p>
            <div className="text-2xl font-bold text-white mb-1">
              {bestSpeaker?.name}
            </div>
            <div className="text-accent-main">
              {bestSpeaker?.explained} слов объяснено
            </div>
          </div>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-gray-400 text-sm uppercase font-bold mb-2">
              Телепат
            </p>
            <div className="text-2xl font-bold text-white mb-1">
              {bestGuesser?.name}
            </div>
            <div className="text-accent-main">
              {bestGuesser?.guessed} слов угадано
            </div>
          </div>
        </div>
        <AccentButton
          onClick={onRestart}
          className="mx-auto px-10 py-4 text-xl"
        >
          <Rocket className="h-6 w-6" /> Вернуться в лобби
        </AccentButton>
      </div>
    </div>
  );
};

function App() {
  const game = useGameStore();
  const { actions, isMuted /*, roomId*/ } = game;

  useEffect(() => {
    actions.checkAuth();
    const session = actions.restoreSession();
    if (session) {
      actions.joinRoom(session.selfName, session.roomId);
    }
  }, []);

  const speaker = useMemo(
    () => game.players.find((p: Player) => p.id === game.round.speakerId),
    [game.players, game.round.speakerId],
  );
  const listener = useMemo(
    () => game.players.find((p: Player) => p.id === game.round.listenerId),
    [game.players, game.round.listenerId],
  );
  const winner = useMemo(() => {
    if (game.settings.mode === 'team')
      return game.teams.find((t) => t.id === game.victory?.winnerId);
    return game.players.find((p) => p.id === game.victory?.winnerId);
  }, [game.victory?.winnerId, game.settings.mode, game.teams, game.players]);

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-text-main font-sans selection:bg-accent-main/30">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-main/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      {game.stage !== 'login' && (
        <header className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />
            <span className="font-bold text-xl tracking-tight hidden md:block">
              SeaBornAlias
            </span>
          </div>
          <div className="flex items-center gap-4">
            {game.roomId && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                <span>ID:</span>
                <span className="text-white select-all">
                  {game.roomId.replace('alias-', '')}
                </span>
              </div>
            )}
            <button
              onClick={actions.toggleMute}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Вкл/Выкл звук"
            >
              {isMuted ? (
                <VolumeX className="h-5 w-5 text-gray-400" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </button>
            <button
              onClick={() => {
                if (confirm('Вы уверены, что хотите покинуть игру?')) {
                  actions.leaveGame();
                }
              }}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-red-400"
              title="Покинуть игру"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto px-4 py-4 md:py-8 pb-20">
        {game.stage === 'login' && <LoginScreen />}
        {game.stage === 'lobby' && (
          <LobbyScreen
            roomId={game.roomId}
            settings={game.settings}
            players={game.players}
            teams={game.teams}
            isHost={game.isHost}
            selfId={game.selfId}
            actions={actions}
            customWords={game.customWords}
            customTopic={game.customTopic}
          />
        )}
        {game.stage === 'preround' && (
          <PreRoundScreen
            speaker={speaker}
            listener={listener}
            teams={game.teams}
            players={game.players}
            settings={game.settings}
            selfId={game.selfId}
            currentTeamId={game.round.currentTeamId}
            isHost={game.isHost}
            actions={actions}
            readyMap={game.round.readyMap}
            activeChallenge={game.round.activeChallenge}
          />
        )}
        {game.stage === 'play' && (
          <GameScreen
            speaker={speaker}
            listener={listener}
            timeLeft={game.round.timeLeft}
            word={game.round.currentWord}
            isHost={game.isHost}
            selfId={game.selfId}
            isPaused={!game.round.running}
            currentTeamId={game.round.currentTeamId}
            actions={actions}
          />
        )}
        {game.stage === 'victory' && (
          <VictoryScreen
            winner={winner}
            players={game.players}
            onRestart={actions.restart}
          />
        )}
      </main>
    </div>
  );
}

export default App;
