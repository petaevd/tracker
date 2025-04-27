import React from 'react';
import './TeamMembers.css';

const TeamMembers = ({ teamMembers }) => {
  return (
    <div className="dashboard-card">
      <h3 className="card-title">Участники</h3>
      {teamMembers.length > 0 ? (
        <ul>
          {teamMembers.map((member) => (
            <li key={member.id}>{member.username}</li>
          ))}
        </ul>
      ) : (
        <p>Участники отсутствуют</p>
      )}
    </div>
  );
};

export default TeamMembers;