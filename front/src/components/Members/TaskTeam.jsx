import React, { useEffect } from "react";
import { addMember, searchUsers, removeMember } from '../../store/slices/teamSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from "react-i18next";


export default function TaskTeam({ projectID }) {
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const savedLanguage = localStorage.getItem("language");
        if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);
    const teams = useSelector(state => state.teams.teams);
    const projects = useSelector(state => state.projects.projects);

    const project = projects.find(p => p.id === Number(projectID));
    const teamID = Number(project?.team_id);
    const currentTeam = teams.find(team => team.id === teamID);
    
    const members = currentTeam?.members || [];
    console.log(members);

    if (!projectID || !project || !members) return null;

    return (
        <div className="form-group">
          <label>{t("sf_project_members")}</label>
          {members.length > 0 ? (
            <ul className="list-group mt-2">
              {members.map((user) => (
                <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{user.username}</strong> ({user.email})
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <label className="text-muted">{t("sf_not_found")}</label>
          )}
        </div>
    );
    }
