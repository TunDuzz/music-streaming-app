import React from 'react';

const Search = () => {
    return (
        <div className="search-page">
            <h2>Search</h2>
            <input type="text" placeholder="Search for songs, artists, albums..." />
            <div className="search-results">
                {/* Search results will be displayed here */}
            </div>
        </div>
    );
};

export default Search;
