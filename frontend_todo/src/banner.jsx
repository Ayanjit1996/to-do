import React, { useState } from 'react';

function Sidebanner({signup,signin}) {
    return (
        <div className="col container custom_banner">
            <div className="brand fw-bold fs-1"> To-do-LIST </div>
            {signup && <div className="brand-sub fs-3"> Signup Form </div>}
            {signin && <div className="brand-sub fs-3"> Signin Form </div>}
        </div>
    );
}

export default Sidebanner;