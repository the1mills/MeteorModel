# MeteorModel


"Favor object composition over class inheritance."

-The Gang of Four, "Design Patterns"


"Always bet on JS" - Eric Elliot

Object-literal outperforms everything else

make sure to check for instanceof, isprototypeof, typeof etc


the package was created for maximum usefulness, speed and simplicity

uses the decorator pattern to create a factory object, which outputs a new instance of itself with the data you pass it


This package was inspired by Josh Owens article:

Coming from Ruby on Rails, I really missed having an ORM available to me when I was working in Meteor.js. They offer a basic db layer called Collections, but it feels a little thin when you are first getting started. It leaves you wanting an easy way to decorate each model in a collection with business logic and helper methods like most good ORM layers, such as ActiveRecord or Mongoid. So what is a programmer to do?

inspired by: collection-helpers and minimongoid.

and also inspired by:

