import React, { useEffect } from "react";
import { getAssignee, addAssignee, removeAssignee } from '../../store/slices/taskSlice';
import { getTeams } from "../../store/slices/teamSlice";
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from "react-i18next";

export default function TaskTeam({ projectID, taskID }) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const teams = useSelector(state => state.teams.teams);
  const projects = useSelector(state => state.projects.projects);
  const tasks = useSelector(state => state.tasks.tasks);
  const user = useSelector(state => state.auth.user);


  const project = projects.find(p => p.id === Number(projectID));
  const teamID = Number(project?.team_id);
  const currentTeam = teams.find(team => team.id === teamID);
  const members = currentTeam?.members || [];

  const task = tasks.find(t => t.id === taskID);
  const assignee = task?.assignee || null;

  console.log('teamID:', teamID, typeof teamID);
  console.log('teams:', teams.map(t => ({id: t.id, type: typeof t.id})));
  console.log(taskID);

  useEffect(() => {
    if (taskID) {
      dispatch(getAssignee(taskID));
    }
  }, [taskID, dispatch]);


  useEffect(() => {
    dispatch(getTeams(user)).catch((err) => {
        console.error('Ошибка загрузки команд:', err);
    });
  }, [dispatch]);

  const handleAddAssignee = async (userId) => {
    if (!taskID) {
      console.error("taskID отсутствует, не могу добавить ответственного");
      return;
    }
    try {
      await dispatch(addAssignee({ taskId: taskID, assigneeId: userId })).unwrap();
      await dispatch(getAssignee(taskID));
    } catch (error) {
      console.error("Ошибка при добавлении ответственного:", error);
    }
  };

  const handleRemoveAssignee = () => {
    dispatch(removeAssignee(taskID));
  };

  if (!projectID || !project) return null;

  return (
    <div className="form-group">

      {/* Текущий ответственный */}
      <div className="mb-3">
        <strong>{t("sf_current_assignee")}: </strong>
        {assignee ? (
          <>
            {assignee.username} ({assignee.email}){" "}
            <button
              type="button"
              className="btn btn-sm btn-danger ms-2"
              onClick={handleRemoveAssignee}
            >
              {t("sf_remove_assignee")}
            </button>
          </>
        ) : (
          <span className="text-muted">{t("sf_none_assigned")}</span>
        )}
      </div>

      {/* Список участников */}
      {members.length > 0 ? (
        <ul className="list-group mt-2">
          {members.map((user) => {
            const isCurrentAssignee = assignee && assignee.id === user.id;
            return (
              <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{user.username}</strong> ({user.email})
                </div>
                <div>
                  {!isCurrentAssignee && (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAddAssignee(user.id)}
                    >
                      {t("sf_assign")}
                    </button>
                  )}
                  {isCurrentAssignee && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={handleRemoveAssignee}
                    >
                      {t("sf_remove")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <label className="text-muted">{t("sf_not_found")}</label>
      )}
    </div>
  );
}
