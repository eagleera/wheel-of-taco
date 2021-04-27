import React, { useEffect, useState } from "react";
import "./app.css";
import gsap, { TweenLite, TweenMax } from "gsap";
import Draggable from "gsap/Draggable";
import uuid from "react-uuid";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
gsap.registerPlugin(Draggable);

function App() {
  const [winner, setWinner] = useState(undefined);
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const colors = ["#F87171", "#FBBF24", "#34D399", "#60A5FA", "#818CF8"];
  const RADIAN = Math.PI / 180;
  const size = useWindowSize();

  useEffect(() => {
    fetchTacos();
  }, []);

  async function fetchTacos() {
    let counter = 0;
    while (counter < 4) {
      const response = await fetch(
        "https://taco-randomizer.herokuapp.com/random/"
      );
      const data = await response.json();
      if (!items.find((x) => x.name === data.base_layer.name)) {
        items.push({
          id: uuid(),
          name: data.base_layer.name,
          url: data.base_layer.url,
          times: 1,
          background: colors[counter],
        });
        counter++;
      }
    }
    setReady(true);
  }

  let pos = 0;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const name = `${items[index].name.split(" ").splice(0, 3).join(" ")}...`;

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={calcSize('fontsize')}
      >
        {name}
      </text>
    );
  };

  async function rotate() {
    let x = randomNumber(1080, 1800); //between 2-4 wheel turns
    pos = pos + x;
    await gsap.to(".recharts-pie", {
      duration: 1,
      rotation: pos,
      transformOrigin: "50% 50%",
      ease: " power2. ease-in-out",
    });
    let pieSectors = document.getElementsByClassName("recharts-pie-sector");
    Array.from(pieSectors).forEach((sector, index) => {
      if (Draggable.hitTest(sector, "#arrow", calcSize('threshold'))) {
        setWinner(items[index]);
      }
    });
  }

  const randomNumber = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

    function calcSize(type) {
      if(type === 'wheel') {
        if(size.width > 1150) {
          return 600;
        } else if (size.width > 800) {
          return 400
        } else {
          return 300
        }
      } else if(type === 'fontsize') {
        if(size.width > 1150) {
          return 12;
        } else if (size.width > 800) {
          return 10
        } else {
          return 8
        }
      } else if(type === 'threshold') {
        if(size.width > 1150) {
          return "30px";
        } else if (size.width > 800) {
          return "20px";
        } else {
          return "10px";
        }
      }
    }
  return (
    <div className="App">
      <h1 className="title">The wheel of Taco 🌮</h1>
      <section className="wheel">
        {ready ? (
          <PieChart width={calcSize('wheel')} height={calcSize('wheel')} style={{ margin: "0 auto" }}>
            <Pie
              data={items}
              labelLine={false}
              label={renderCustomizedLabel}
              fill="#8884d8"
              dataKey="times"
              isAnimationActive={false}
              redraw={false}
            >
              {items.map((el, index) => (
                <Cell key={`cell-${index}`} fill={el.background} />
              ))}
            </Pie>
          </PieChart>
        ) : (
          <p>Loading...</p>
        )}
        {ready && <div className="arrow" id="arrow" />}
      </section>
      <button onClick={rotate}>Spin</button>
      {winner && (
        <h1>
          Winner:
          <a href={winner.url} target="_blank">
            {winner.name} <small>(Click for recipe)</small>
          </a>
        </h1>
      )}
    </div>
  );
}


function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}

export default App;
