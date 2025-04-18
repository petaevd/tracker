import React, { useState } from 'react';
import { Pagination } from 'react-bootstrap';

const Tasks = () => {
  const [activePage, setActivePage] = useState(1);

  const handlePageChange = (pageNumber) => {
    setActivePage(pageNumber);
  };

  return (
    <div>
      <h1>Задачи</h1>
      <p>Список задач будет здесь.</p>
      <Pagination>
        <Pagination.Prev />
        <Pagination.Item active={activePage === 1} onClick={() => handlePageChange(1)}>1</Pagination.Item>
        <Pagination.Item active={activePage === 2} onClick={() => handlePageChange(2)}>2</Pagination.Item>
        <Pagination.Item active={activePage === 3} onClick={() => handlePageChange(3)}>3</Pagination.Item>
        <Pagination.Next />
      </Pagination>
    </div>
  );
};

export default Tasks;