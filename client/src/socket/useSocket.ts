import { useEffect } from 'react';
import { socket } from './socket';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { SOCKET_EVENTS } from '@chaos-chess/shared';

export function useSocket() {
  const {
    setRoomState,
    setGameState,
    setRoomCode,
    setPlayerColor,
    setIsSpectator,
    setIsConnected,
    setDrawOfferFrom,
    setRuleMapping,
    setCountdown,
    updateTimers,
  } = useGameStore();

  const { setErrorMessage } = useUIStore();

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setErrorMessage(null);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onConnectError(err: Error) {
      setErrorMessage(`Connection Error: ${err.message}`);
    }

    function onRoomCreated(payload: any) {
      setRoomCode(payload.roomCode);
      setRoomState(payload.roomState);
      setPlayerColor(payload.playerColor);
      setIsSpectator(false);
      setErrorMessage(null);
    }

    function onRoomJoined(payload: any) {
      setRoomCode(payload.roomCode);
      setRoomState(payload.roomState);
      setPlayerColor(payload.playerColor);
      setIsSpectator(payload.isSpectator);
      setErrorMessage(null);
    }

    function onRoomUpdated(payload: any) {
      setRoomState(payload.roomState);
      if (payload.roomState.gameState) {
        setGameState(payload.roomState.gameState);
        setRuleMapping(payload.roomState.gameState.ruleMapping);
      } else {
        setGameState(null);
        setRuleMapping(null);
      }
    }

    function onCountdown(payload: any) {
      setCountdown(payload.value);
      setRuleMapping(payload.ruleMapping);
    }

    function onGameStarted(payload: any) {
      setCountdown(null);
      setGameState(payload.gameState);
      setRoomState(payload.roomState);
      if (payload.gameState) {
        setRuleMapping(payload.gameState.ruleMapping);
      }
    }

    function onMoveMade(payload: any) {
      setGameState(payload.gameState);
    }

    function onGameOver(payload: any) {
      setGameState(payload.gameState);
    }

    function onDrawOffered(payload: any) {
      setDrawOfferFrom(payload.from);
    }

    function onDrawDeclined() {
      setErrorMessage('Draw offer declined.');
      setTimeout(() => setErrorMessage(null), 3000);
    }

    function onReconnected(payload: any) {
      setRoomCode(payload.roomCode);
      setRoomState(payload.roomState);
      setPlayerColor(payload.playerColor);
      setIsSpectator(payload.isSpectator);
      if (payload.roomState.gameState) {
        setGameState(payload.roomState.gameState);
        setRuleMapping(payload.roomState.gameState.ruleMapping);
      }
      setErrorMessage(null);
    }

    function onPlayerDisconnected(payload: any) {
      setRoomState(payload.roomState);
      setErrorMessage(`Player ${payload.nickname} disconnected.`);
      setTimeout(() => setErrorMessage(null), 4000);
    }

    function onPlayerReconnected(payload: any) {
      setRoomState(payload.roomState);
      setErrorMessage(`Player ${payload.nickname} reconnected.`);
      setTimeout(() => setErrorMessage(null), 3000);
    }

    function onTimerTick(payload: any) {
      updateTimers(payload.timers);
    }

    function onError(payload: any) {
      setErrorMessage(payload.message);
      setTimeout(() => setErrorMessage(null), 4000);
    }

    // Connect standard socket lifecycle
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Custom events
    socket.on(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
    socket.on(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
    socket.on(SOCKET_EVENTS.ROOM_UPDATED, onRoomUpdated);
    socket.on(SOCKET_EVENTS.COUNTDOWN, onCountdown);
    socket.on(SOCKET_EVENTS.GAME_STARTED, onGameStarted);
    socket.on(SOCKET_EVENTS.MOVE_MADE, onMoveMade);
    socket.on(SOCKET_EVENTS.GAME_OVER, onGameOver);
    socket.on(SOCKET_EVENTS.DRAW_OFFERED, onDrawOffered);
    socket.on(SOCKET_EVENTS.DRAW_DECLINED, onDrawDeclined);
    socket.on(SOCKET_EVENTS.RECONNECTED, onReconnected);
    socket.on(SOCKET_EVENTS.PLAYER_DISCONNECTED, onPlayerDisconnected);
    socket.on(SOCKET_EVENTS.PLAYER_RECONNECTED, onPlayerReconnected);
    socket.on('timer-tick', onTimerTick);
    socket.on(SOCKET_EVENTS.ERROR, onError);

    // Initial check
    if (socket.connected) {
      setIsConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off(SOCKET_EVENTS.ROOM_CREATED, onRoomCreated);
      socket.off(SOCKET_EVENTS.ROOM_JOINED, onRoomJoined);
      socket.off(SOCKET_EVENTS.ROOM_UPDATED, onRoomUpdated);
      socket.off(SOCKET_EVENTS.COUNTDOWN, onCountdown);
      socket.off(SOCKET_EVENTS.GAME_STARTED, onGameStarted);
      socket.off(SOCKET_EVENTS.MOVE_MADE, onMoveMade);
      socket.off(SOCKET_EVENTS.GAME_OVER, onGameOver);
      socket.off(SOCKET_EVENTS.DRAW_OFFERED, onDrawOffered);
      socket.off(SOCKET_EVENTS.DRAW_DECLINED, onDrawDeclined);
      socket.off(SOCKET_EVENTS.RECONNECTED, onReconnected);
      socket.off(SOCKET_EVENTS.PLAYER_DISCONNECTED, onPlayerDisconnected);
      socket.off(SOCKET_EVENTS.PLAYER_RECONNECTED, onPlayerReconnected);
      socket.off('timer-tick', onTimerTick);
      socket.off(SOCKET_EVENTS.ERROR, onError);
    };
  }, [
    setRoomState,
    setGameState,
    setRoomCode,
    setPlayerColor,
    setIsSpectator,
    setIsConnected,
    setDrawOfferFrom,
    setRuleMapping,
    setCountdown,
    updateTimers,
    setErrorMessage,
  ]);
}
