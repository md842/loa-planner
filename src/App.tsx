import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'

import {createBrowserRouter, Outlet, RouterProvider} from "react-router-dom";

import Header from './components/Header';
import Footer from './components/Footer';

import Planner from './pages/Planner';
//import Calculators from './pages/Calculators';
//import PlannedFeatures from './pages/PlannedFeatures';
import NoPage from './pages/NoPage'; // 404

function Layout(){ /* Display the routed main between Header and Footer */
  return(
    <>
      <Header/>
      <Outlet/>
      <Footer/>
    </>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
    {
      index: true,
      element: <Planner/>,
    },
    /*
    {
      path: "/calculators",
      element: <Calculators/>,
    },
    {
      path: "/planned-features",
      element: <PlannedFeatures/>,
    },
    */
    {
      path: "*",
      element: <NoPage/>,
    }]
  }
]);

export default function App(){
  return(
    <RouterProvider router={router}/>
  )
}
