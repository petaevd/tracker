import React from "react";
import { addMember, searchUsers, removeMember } from '../../store/slices/teamSlice';
import { useSelector, useDispatch } from 'react-redux';

export default function SearchField ({ teamID }) {
    

    const dispatch = useDispatch()
    const searchResults = useSelector(state => state.teams.searchResults)
    const currentMembers = useSelector(state => state.teams.teams.find(team => team.id === teamID).members)
    const filteredSearchResults = searchResults.filter(user => 
        !currentMembers.some(member => member.id === user.id)
    );

    if (!teamID) return null;

    const handleSearchField = async (e) => {
        try {
            await dispatch(searchUsers(e.target.value)).unwrap()
        } catch (error) {
            console.error("Ошибка при поиске:", error)
        }
    };

    return (
        <>
            <div className="form-group">
                <label>Текущие участники</label>
                {currentMembers.length > 0 ? (
                    <ul className="list-group mt-2">
                        {currentMembers.map(user => (
                            <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{user.username}</strong> ({ user.email })
                                </div>
                                <div className="ml-auto">
                                    <button
                                        onClick={() => dispatch(removeMember({ teamId: teamID, userId: user.id }))}
                                        className="btn btn-sm btn-danger"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <label className="text-muted">
                        Не найдено
                    </label>
                )}
            </div>

            <div className="form-group">
                <label>Поиск участников</label>
                <input
                    type="text"
                    className="form-control"
                    onChange={handleSearchField}
                />
                {filteredSearchResults.length > 0 && (
                    <ul className="list-group mt-2">
                        {filteredSearchResults.map(user => (
                            <li key={user.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{user.username}</strong> ({user.email})
                                </div>
                                <div className="ml-auto">
                                    <button
                                        onClick={() => {console.log(user); dispatch(addMember({ teamId: teamID, user: user }))}}
                                        className="btn btn-sm btn-primary mr-2"
                                    >
                                        Добавить
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}
