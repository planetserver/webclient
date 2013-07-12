/*======================================================================================================================
    EarthServer Project
    2012 Fraunhofer IGD

    File:           Main.js
    Last change:    06.08.2012

    Description:

======================================================================================================================*/
var sceneManager = new SceneManager();


$(document).ready(function()
{
    sceneManager.startUp();

    //Set up element events
    //create Scene Button
    document.getElementById('createSceneButton').setAttribute('onclick', 'sceneManager.createNewScene();');

    //Camera/view Buttons
    document.getElementById('topViewButton').setAttribute('onclick', 'sceneManager.setView("top");');
    document.getElementById('frontViewButton').setAttribute('onclick', 'sceneManager.setView("front");');
    document.getElementById('sideViewButton').setAttribute('onclick', 'sceneManager.setView("side");');

    //window.setValueField = sceneManager.sr.setValueField;
    //window.getHeightMapPart = sceneManager.sr.getHeightMapPart;
});