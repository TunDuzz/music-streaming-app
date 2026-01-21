import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Player from './Player';

const Layout = ({ children }) => {
    return (
        <div className="app-layout">
            <Header />
            <div className="main-content">
                <Sidebar />
                <main className="content">
                    {children}
                </main>
            </div>
            <Player />
        </div>
    );
};

export default Layout;
