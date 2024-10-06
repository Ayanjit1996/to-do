import Signup from './signup';
import Signin from './signin';
import Sidebanner from './banner';
import React, { useState } from 'react';

function Landing({signup,signin,setOtpModalOpen,setId}){
return (<div className='main_div'>
    <Sidebanner signup={signin} signin={signup}/>
    { signin && <Signup setOtpModalOpen={setOtpModalOpen} setId={setId}/>}
    { signup && <Signin setOtpModalOpen={setOtpModalOpen} setId={setId}/>}
</div>)}

export default Landing;