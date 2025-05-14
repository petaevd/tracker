import React, { useEffect } from "react";
import { addMember, searchUsers, removeMember } from '../../store/slices/teamSlice';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

export default function SearchField ({ teamID }) {

    // ================ Перевод ================
    const { t, i18n } = useTranslation();
    useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage && savedLanguage !== i18n.language) {
        i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);
    // ================ Перевод ================
    const dispatch = useDispatch()
    const searchResults = useSelector(state => state.teams.searchResults)
    const currentTeam = useSelector(state =>
        state.teams.teams.find(team => team.id === teamID)
      );
      
    const currentMembers = currentTeam?.members || [];
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
                <label>{t('sf_current_member')}</label>
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
                                        {t('sf_remove_member')}
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <label className="text-muted">
                        {t('sf_not_found')}
                    </label>
                )}
            </div>

            <div className="form-group">
                <label>{t('sf_search')}</label>
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
                                        {t('sf_add_member')}
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
