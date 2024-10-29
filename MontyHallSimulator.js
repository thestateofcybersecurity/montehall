const MontyHallSimulator = () => {
  const [doors, setDoors] = useState([
    { id: 0, state: 'closed', hasPrize: false },
    { id: 1, state: 'closed', hasPrize: false },
    { id: 2, state: 'closed', hasPrize: false },
  ]);
  const [gameState, setGameState] = useState('initial'); // initial, firstPick, revealed, final
  const [selectedDoor, setSelectedDoor] = useState(null);
  const [revealedDoor, setRevealedDoor] = useState(null);
  const [stats, setStats] = useState({
    switchWins: 0,
    switchLosses: 0,
    stayWins: 0,
    stayLosses: 0,
  });
  const [autoSimResults, setAutoSimResults] = useState(null);

  const resetGame = () => {
    const newDoors = doors.map(door => ({ ...door, state: 'closed' }));
    const prizeIndex = Math.floor(Math.random() * 3);
    newDoors[prizeIndex].hasPrize = true;
    setDoors(newDoors);
    setGameState('initial');
    setSelectedDoor(null);
    setRevealedDoor(null);
  };

  const handleDoorClick = (doorId) => {
    if (gameState === 'initial') {
      setSelectedDoor(doorId);
      setGameState('firstPick');
      revealDoor(doorId);
    } else if (gameState === 'revealed') {
      finishGame(doorId);
    }
  };

  const revealDoor = (selectedId) => {
    const availableDoors = doors
      .filter(door => !door.hasPrize && door.id !== selectedId)
      .map(door => door.id);
    const doorToReveal = availableDoors[Math.floor(Math.random() * availableDoors.length)];
    setRevealedDoor(doorToReveal);
    const newDoors = [...doors];
    newDoors[doorToReveal].state = 'revealed';
    setDoors(newDoors);
    setGameState('revealed');
  };

  const finishGame = (finalChoice) => {
    const switched = finalChoice !== selectedDoor;
    const won = doors[finalChoice].hasPrize;
    
    setStats(prev => ({
      ...prev,
      ...(switched
        ? { switchWins: prev.switchWins + (won ? 1 : 0), switchLosses: prev.switchLosses + (won ? 0 : 1) }
        : { stayWins: prev.stayWins + (won ? 1 : 0), stayLosses: prev.stayLosses + (won ? 0 : 1) })
    }));

    const newDoors = doors.map(door => ({
      ...door,
      state: 'revealed'
    }));
    setDoors(newDoors);
    setGameState('final');
  };

  const runAutoSim = () => {
    let switchWins = 0;
    let stayWins = 0;
    const trials = 10000;

    for (let i = 0; i < trials; i++) {
      const prizeIndex = Math.floor(Math.random() * 3);
      const firstChoice = Math.floor(Math.random() * 3);
      
      // Find door to reveal (not prize, not chosen)
      const availableToReveal = [0, 1, 2].filter(
        door => door !== prizeIndex && door !== firstChoice
      );
      const revealed = availableToReveal[Math.floor(Math.random() * availableToReveal.length)];
      
      // Switch choice
      const switchChoice = [0, 1, 2].find(
        door => door !== firstChoice && door !== revealed
      );
      
      if (switchChoice === prizeIndex) switchWins++;
      if (firstChoice === prizeIndex) stayWins++;
    }

    setAutoSimResults({
      switchWinRate: (switchWins / trials) * 100,
      stayWinRate: (stayWins / trials) * 100,
      trials
    });
  };

  const chartData = [
    {
      name: 'Switch',
      wins: stats.switchWins,
      losses: stats.switchLosses,
      winRate: stats.switchWins + stats.switchLosses > 0 
        ? (stats.switchWins / (stats.switchWins + stats.switchLosses) * 100).toFixed(1)
        : 0
    },
    {
      name: 'Stay',
      wins: stats.stayWins,
      losses: stats.stayLosses,
      winRate: stats.stayWins + stats.stayLosses > 0 
        ? (stats.stayWins / (stats.stayWins + stats.stayLosses) * 100).toFixed(1)
        : 0
    }
  ];

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monty Hall Problem Simulator</CardTitle>
          <CardDescription>
            In this game show problem, there are three doors. Behind one door is a prize, behind the others are goats.
            Pick a door, then decide whether to switch after one wrong door is revealed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4 mb-6">
            {doors.map((door) => (
              <Button
                key={door.id}
                onClick={() => handleDoorClick(door.id)}
                disabled={door.state === 'revealed' || gameState === 'final'}
                variant={selectedDoor === door.id ? "default" : "outline"}
                className="h-40 w-32 flex flex-col items-center justify-center gap-2"
              >
                <Door size={32} />
                {door.state === 'revealed' && (
                  <div className="text-sm">
                    {door.hasPrize ? '🏆' : '🐐'}
                  </div>
                )}
                <div className="text-sm">Door {door.id + 1}</div>
              </Button>
            ))}
          </div>
          
          <div className="text-center mb-4">
            {gameState === 'initial' && (
              <p>Choose a door to start!</p>
            )}
            {gameState === 'revealed' && (
              <p>Door {revealedDoor + 1} has a goat. Do you want to switch your choice?</p>
            )}
            {gameState === 'final' && (
              <p>Game Over! {doors[selectedDoor].hasPrize ? 'You won! 🎉' : 'You lost! Try again!'}</p>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={resetGame} variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" /> New Game
            </Button>
            <Button onClick={runAutoSim} variant="outline">
              <Play className="mr-2 h-4 w-4" /> Run 10,000 Simulations
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <BarChart width={600} height={300} data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wins" fill="#4ade80" name="Wins" />
              <Bar dataKey="losses" fill="#f87171" name="Losses" />
            </BarChart>
          </div>

          {autoSimResults && (
            <div className="space-y-2">
              <p className="font-semibold">Automated Simulation Results ({autoSimResults.trials.toLocaleString()} trials):</p>
              <p>Switch Win Rate: {autoSimResults.switchWinRate.toFixed(1)}%</p>
              <p>Stay Win Rate: {autoSimResults.stayWinRate.toFixed(1)}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>The Math Behind the Paradox</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              The Monty Hall problem is a probability puzzle named after the host of the game show "Let's Make a Deal."
              While it may seem counterintuitive, switching doors gives you a 2/3 chance of winning, while staying with
              your initial choice gives you only a 1/3 chance.
            </p>
            <p>
              Here's why:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Initially, you have a 1/3 chance of picking the right door and a 2/3 chance of picking a wrong door.</li>
              <li>When Monty reveals a goat, he's using his knowledge of the prize location to help you - he will always show you a goat.</li>
              <li>If you initially picked a goat (2/3 probability), switching will always win you the prize.</li>
              <li>If you initially picked the prize (1/3 probability), switching will always lose.</li>
              <li>Therefore, switching wins 2/3 of the time, while staying wins 1/3 of the time.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Mount the application
const root = createRoot(document.getElementById('root'));
root.render(<MontyHallSimulator />);
