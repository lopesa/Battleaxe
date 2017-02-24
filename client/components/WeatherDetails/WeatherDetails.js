import React from 'react';
import Draggable from 'react-draggable';
import config from './../../config/config';
import firebaseApp from '../../base';
import classnames from 'classnames';
import weatherConditions from './weatherConditions';

const database = firebaseApp.database();

import styles from './WeatherDetails.css';

class WeatherDetails extends React.Component {
  constructor(props) {
    super(props);

    this.dashboard = this.props.dashboard;
    this.db_key = this.props.db_key;
    this.weatherModule = this.dashboard.modules[this.db_key];
    var context = this;

    this.state = {
      temperature: null,
      location: null,
      condition: null,
      weatherIcon: null,
      zipcode: context.weatherModule.zip || 94105,
      code: null
    }

    // this.weatherCondition = {
    //   'Clear': 'https://68.media.tumblr.com/95f04db0cb5b8ceaf1c4fb1264f2c88d/tumblr_oljwb1sCii1qd4km8o1_400.png',
    //   'Rain': 'https://68.media.tumblr.com/1024b9f6ee2a91fb93214cbdf224beaf/tumblr_oljwry0gjD1qd4km8o1_400.png',
    //   'Clouds': 'http://demo.sc.chinaz.com/Files/pic/icons/6256/k19.png'
    // }

    this.weatherAPIkey = config.openWeatherMapAPIKey;
    this.getWeatherData = this.getWeatherData.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getWeatherData() {
    var context = this;

    // $.ajax({
    //   method: 'GET',
    //   url: `https://api.apixu.com/v1/current.json?key=${config.apixuWeatherApiKey}&q=${context.state.zipcode}`,
    //   dataType: 'json',
    //   success: function(data) {
    //     context.setState({
    //       temperature: Math.round(data.current.temp_f),
    //       location: data.location.name,
    //       condition: data.current.condition.text,
    //       weatherIcon: data.current.condition.icon
    //     });
    //   },
    //   error: function(err) {
    //     console.log(err);
    //     throw err;
    //   }
    // });

    $.ajax({
      method: 'GET',
      url: `https://query.yahooapis.com/v1/public/yql?q=select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="${context.state.zipcode}")&format=json`,
      dataType: 'json',
      success: function(data) {
        context.setState({
          temperature: data.query.results.channel.item.condition.temp,
          location: data.query.results.channel.location.city,
          condition: data.query.results.channel.item.condition.text,
          weatherIcon: data.query.results.channel.image.url,
          code: data.query.results.channel.item.condition.code
        });
      },
      error: function(err) {
        console.log(err);
        throw err;
      }
    });
  }

  componentDidMount() {
    // var context = this;
    this.getWeatherData();

    setInterval(() => {
      console.log('grabbing weather');
      this.getWeatherData();
    }, 1800000); // time interval of 30 minutes
  }

  handleSubmit(e) {
    e.preventDefault();
    const db_key = this.props.db_key;
    const user = this.props.user.uid;
    const db_ref = database.ref(`users/${user}/modules/${db_key}/zip`);

    let zipcode = this.searchInput.value;

    db_ref.set(zipcode);

    this.setState({
      zipcode: zipcode
    }, () => {
      this.getWeatherData();

      setInterval(() => {
        console.log('grabbing weather');
        this.getWeatherData();
      }, 1800000);

      this.zipForm.reset();
    });
  }

  render() {
    let cssCard = `${styles.card} card`;
    let cssCardContent = `${styles.cardContent} card-content`;

    let collapsed = this.props.collapsed.collapsed;
    let collapsedStyle = classnames(`${styles.height}`, collapsed ? `${styles.collapsedStyle}` : '');
    let weatherIcon = `${styles.weatherIcon} wi wi-yahoo-${this.state.code}`;
    return (
      <div className=''>
          <div className={cssCard}>
            <header className='card-header'>
              <p className='card-header-title'>Weather</p>
              <div className={styles.searchIcon}><i className='fa fa-search' aria-hidden='true'></i></div>
              <form action='submit'
                    className={styles.weatherForm}
                    onSubmit={e => this.handleSubmit(e)}
                    ref={input => this.zipForm = input}
                    >
                <input className={styles.weatherInput} 
                        type='text' 
                        ref={input => this.searchInput = input}
                        placeholder=' Enter zip'
                        />               
              </form>
              <div className="card-header-icon">
                <span className="icon">
                  <i onClick={this.props.handleCollapseFunction} className='fa fa-cloud' aria-hidden='true'></i>
                </span>
              </div>
            </header>
            <div className={collapsedStyle}>
              <div className={cssCardContent}>
                <div>
                  <p className={styles.location}>{this.state.location}</p>
                  <p className={styles.condition}>{this.state.condition}</p>
                </div>
                <i className={weatherIcon}></i>
                <p className={styles.temperature}> 
                  {this.state.temperature}ºF
                </p>
              </div>
            </div>
          </div>
      </div>
    )
  }
}
        // <Draggable bounds='body'>
        // </Draggable>

export default WeatherDetails;

// <img src={this.state.weatherIcon} className={styles.image}/>
