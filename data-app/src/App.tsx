import './App.css';
import React, {ChangeEvent, Component, SyntheticEvent} from 'react';
import axios from 'axios';


//This will work if you replace the attemped process.env call with a vaild public token 
const axiosGithubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${
      process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN
    }`,
  },
});
const GET_REPO = (owner, name) => `
query {
    repository(owner:"${owner}", name:"${name}"){
    description
    stargazerCount
    url
    issues(last:100, states:CLOSED) {
      totalCount
      edges {
        node {
          title
          url
          labels(last:5) {
            edges {
              node {
                name
              }
            }
          }
        }
      }
    }
  }
}
`;

class App  extends Component{

  state = {
    path: "",
    repository: null,
    errors: null,
    description: null,
    moredetails: null,
  };

  onChange = (event: ChangeEvent<HTMLInputElement>) => {
  
    this.setState({path: event.target.value, repository: null, erorrs: null, moredetails: null});
  };

  onSubmit = (event: SyntheticEvent) => {
    this.onFetchFromGitHub(this.state.path);
    event.preventDefault();
  }
  componentDidMount(){
    //this.onFetchFromGitHub(this.state.path);
  }
  onFetchFromGitHub = path => {
    
    const [owner, name] = path.split('/');
    axiosGithubGraphQL
      .post('', {query: GET_REPO(owner, name)})
      .then(result =>
        this.setState(() => ({
          repository: result.data.data.repository,
          errors: result.data.errors,
          description: result.data.data.repository.description,
          issues: result.data.data.repository.issues,
          })
        )
      );
  }

  fetchMoreDetails = () => {

    this.setState(() => ({

      moredetails:  <table className="more">
                    <tbody>
                      <tr>
                        <td>Description of Repository:</td>
                      </tr>
                      <tr>
                        <td colSpan={5}>{this.state.description}</td>
                      </tr>
                    </tbody>
                    
                    </table>
                    
    }))
  }
  render() {
    const { path, repository, moredetails, errors} = this.state;

    

    return (
      <div className="App">
        <form id="form" onSubmit={this.onSubmit}>
        <input type="text" className="search" value={path} onChange={this.onChange} placeholder="Enter a repository. owner/name" ></input>
        <button type="submit">Search</button>
      </form>
          <Repository 
            path={path}
            repository={repository} 
            errors={errors} 
            fetchMoreDetails={this.fetchMoreDetails} 
            moredetails={moredetails}
            />
      </div>
    );      
  }
}

const Repository = ({ path, repository, errors, moredetails, fetchMoreDetails}) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong:</strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    );
  }
  
  if(repository != null){
    const [owner, name] = path.split('/'); 
    console.log(moredetails)
    return (
      <div>
        <table className='info'>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Name</th>
            <th>Number of Issues</th>
            <th>Stars</th>
            <th>Url</th>
            <th>More Details</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <th>{owner}</th>
            <th>{name}</th>
            <th>{repository.issues.totalCount}</th>
            <th>{repository.stargazerCount}</th>
            <th><a href={repository.url}>link</a></th>
            <th><button onClick={fetchMoreDetails}>More Details</button></th>
          </tr>          
          </tbody>
        </table>
        {moredetails}
      </div>
    );
  }
  else {
    return(
      <p>Nothing yet...</p>
    );
  }
}

export default App;
