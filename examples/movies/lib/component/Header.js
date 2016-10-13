import React from 'react';
import SearchInput from 'react-search-input'



class Header extends React.Component {

  searchUpdated(term) {
    console.log(term);
  }

  render() {
    return (
      <header>
        <SearchInput className="search-input" onChange={this.searchUpdated} />
      </header>
    );
  }
}

export default Header;
