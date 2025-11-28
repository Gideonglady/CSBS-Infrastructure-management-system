import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DigitalRegistersHome from './DigitalRegisters/DigitalRegistersHome';
import Classrooms from './DigitalRegisters/Classrooms';
import Laboratories from './DigitalRegisters/Laboratories';

const DigitalRegisters = () => {
  return (
    <Routes>
      <Route index element={<DigitalRegistersHome />} />
      <Route path="classrooms" element={<Classrooms />} />
      <Route path="labs" element={<Laboratories />} />
    </Routes>
  );
};

export default DigitalRegisters;
