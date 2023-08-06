// The Rooms :/

process.rooms = {
  "0": {
    "0": {
      "0": {
        name: "~ Somewhere Mysterious ~",
        description: "You are in a black void, with no floor, walls, or ceiling. It's a very strange place to be, like there's truly nothing here. It's just--empty. It's almost as if you left the world you knew.\n\nTo get back, you will need to use the 'void' command, which will bring you back to the game spawn point. Alternatively, you can contact an administrator.",
        exits: {
          north: {
            coords: [
              0,
              0,
              0
            ],
            description: "To the north, you see darkness."
          },
          east: {
            coords: [
              0,
              0,
              0
            ],
            description: "To the east, you see darkness."
          },
          south: {
            coords: [
              0,
              0,
              0
            ],
            description: "To the south, you see darkness."
          },
          west: {
            coords: [
              0,
              0,
              0
            ],
            description: "To the west, you see darkness."
          }
        },
        notes: "This is essentially an endless void that players enter, if they go out of bounds.",
        unfinished: true
      },
      "1": {
        name: "Hilltop",
        description: "You are on a hilltop, overlooking the sprawling landscape of Ambia. You experience a feeling of unparalleled tranquility as a breathtaking unfolds stretches before your eyes, revealing the magnificent tapestry of Ambia in all its glory. Rolling fields stretch out beneath you, with lush forests off to the west and towering mountains to the far north. A river, shining with the sun's rays, cuts across the landscape, leading to a glimmering lake to the east. To the south is an enormous castle, with large, imposing walls. The fields below are swaying gently in the soft breeze.\n\nA hush settles over the hilltop, broken only by the gentle symphony of nature. The air is crisp and clean, carrying with it the subtle scents of grass and blooming blossoms. The golden rays of sunlight cast a warm glow, illuminating the landscape in a kaleidoscope of vibrant hues.\n\nYou see a sign next to the trail (type \"read sign\" to read it).",
        exits: {
          north: {
            coords: [
              0,
              -1,
              1
            ],
            description: "To the north, a winding trail leads downhill into a small, quaint town."
          }
        },
        notes: "Add a sign that the player can read that explains the basics of how to move.",
        unfinished: false
      }
    },
    "-1": {
      "1": {
        name: "Winding Trail",
        description: "A winding path leads north through rolling hills and dense forests. The air is crisp and clean, with the scent of wildflowers and damp earth. Ahead of you, the path opens up into a small town.",
        exits: {
          north: {
            coords: [
              0,
              -2,
              1
            ],
            description: "To the north, a winding trail leads downhill into a small, quaint town."
          },
          south: {
            coords: [
              0,
              0,
              1
            ],
            description: "To the south is a beautiful hilltop, overlooking all of Ambia."
          }
        },
        notes: [],
        unfinished: true
      }
    }
  }
};