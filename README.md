## deferred
Wrap around an object and capture sets on its properties and calls on its methods.

## usage

### node
```javascript
const deferred = require("deferred");
```

### browser
```html
<html>
<head>
    <meta charset="UTF-8">
    <script src="src/deferred.js"></script>
</head>
<body>
<script>
// deferred is in the global scope
</script>
</body>
</html>
```

### deferring
```javascript
// assume we have a canvas on a webpage
var ctx = deferred(canvas.getContext("2d"));

// call and set on the deferred object, will not execute immediately
ctx.beginPath();
ctx.lineWidth = 5;
ctx.moveTo(5, 10);
ctx.lineTo(70, 60);
ctx.stroke();

// examine queued commands
console.log(ctx.queue[1]);

// modify queued command arguments
ctx.queue[1].args[1] += 10;	// now becomes ctx.moveTo(5, 20)

// execute all queued commands
ctx.executeAll();

// execute a specific one in the queue
ctx.queue[3].execute();

// clear queued commands (won't clear automatically after executing)
ctx.clearQueue();
```

### indirect wrapping
If you don't have access to object creation (for example if it's done in a library),
then you can patch its creation function.

```javascript
// wrap around with canvas drawing
var oldGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function () {
    return deferred(oldGetContext.apply(this, arguments));
};
```

It's not recommended to try wrapping the CanvasRenderingContext2D's prototype
directly because it contains native calls.

### immediate execution
If you don't actually to defer anything, but instead capture them, then that is available
via the immediatelyExecute option:

```javascript
var ctx = deferred(canvas.getContext("2d"), {immediatelyExecute: true});
```