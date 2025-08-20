import React, {useState, useCallback } from "react";

const Child = React.memo(({onClick}) => {
  console.log("Child Rendered");
  return <button onClick={onClick}>Click Me (Child)</button>
});

function Parent() {
  const [count,setCount] = useState(0);

  console.log("Parent Rendered");

  const handleClick = useCallback(() => {
    console.log("Child Button Clicked!");
  }, []);

  return(
    <div>
    <Child name = "Grace"/>
    <button onClick={() => setCount(count + 1)} >+</button>
    <p>count: {count}</p>
    </div>
  );
}

export default Parent;