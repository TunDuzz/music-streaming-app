import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <nav>
                <ul>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/library">Library</Link></li>
                    <li><Link to="/search">Search</Link></li>
                    {/* More navigation items will go here */}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;
