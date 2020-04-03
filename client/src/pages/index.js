import Head from 'next/head';

const Home = () => (
  <div className="container">
    <main>
      <h1 className="title">TODO: Landing page goes here</h1>

      <h3>Api client at: {process.env.API_URL}</h3>
    </main>
  </div>
);

export default Home;
