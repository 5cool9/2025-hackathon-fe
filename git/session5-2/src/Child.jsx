import React, { useContext } from 'react';
import UserContext from './UserContext';

function Child() {
    const user = useContext(UserContext);

    return(
        <div className = "drill-box child">
            <p className = "drill-title">Child (Context로 받음)</p>
            <p>안녕하세요, {user}님 !</p>
        </div>
    );
}

export default Child;