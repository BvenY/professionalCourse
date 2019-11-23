
(function() {
    ////////// DISPLAY RELATED //////////
    // 设置画布
    let c = document.getElementById("c");
    // 获取画布
    let ctx = c.getContext("2d");

    // 设置画布的高度宽度
    function resizeCanvas() {
        c.width = window.innerWidth * 0.7;
        c.height = window.innerHeight;
    }
    resizeCanvas();
    // 添加事件监听，打开页面调用画布设置方法
    window.addEventListener("resize", resizeCanvas);

    ////////// PID //////////
    // 系统控制核心点的坐标值
    let x = 400;
    let y = 300;
    // 核心点内小圆展示变化趋势
    let vx = 0;
    let vy = 0;
	// PID的调用次数
	let count = 0;
    // 目标点的坐标位置
    let setpointX = x;
    let setpointY = y;
    // Kd 用以计算坐标微分误差值 上一个时间节点的坐标值
    let prevErrorX = 0;
    let prevErrorY = 0;
    // Ki 坐标积分误差值
    let integralX = 0;
    let integralY = 0;

    // 默认的Kp Ki Kd
    let kp = 0.9;
    let ki = 0.8;
    // 设置稳态误差 
    let wind = 0.2;
    let kd = 0.1;

    // 坐标的误差值
    let deltaX = document.getElementById("deltaX");
    let deltaY = document.getElementById("deltaY");
	let countInput = document.getElementById("count");
	let xValue =  document.getElementById('x');
	let yValue =  document.getElementById('y');
    
    function pid() {
        // 当前X坐标的误差值
        let errorX = setpointX - x;
		// 第一次调用PID的时候
        // Ki 误差积分(其实在离散的情况下就是做累加)
        integralX += errorX;
        // Kd 误差微分(当前时刻与上一时刻的误差的差值 肯定是负数)
        let derivativeX = errorX - prevErrorX;
        // 将当前的误差值赋值给上一时间，用作下一次计算的基础
        prevErrorX = errorX;

        let errorY = setpointY - y;
        integralY += errorY;
        let derivativeY = errorY - prevErrorY;
        prevErrorY = errorY;

        // 显示当前的误差值 保留三位小数
        // 这个加号是为了保证value为数字，document可能是字符串
        deltaY.value = +errorY.toFixed(5);
        deltaX.value = +errorX.toFixed(5);
        // 返回PID控制值 缩小1000倍便于canvas上面观察
        let xCode = kp * errorX + ki * integralX + kd * derivativeX;
        let yCode = kp * errorY + ki * integralY + kd * derivativeY;
		count++;
		countInput.value = count;
        return [xCode,yCode];
    }
	//保留n位小数
	function roundFun(value, n) {
	  return Math.round(value*Math.pow(10,n))/Math.pow(10,n);
	}
    // 更新canvas画面
    function update() {
        // 调用PID函数
		let ax;
		let ay;
		if ( x !== setpointX && y !== setpointY){
			// 设置误差为五位小数
			if (Math.abs(x - setpointX) > 0.00001 && Math.abs(y - setpointY) > 0.00001){
				let xCode = pid();
				ax = xCode[0];
				ay = xCode[1];
				x = roundFun(x + ax - wind,5);
				y = roundFun(y + ay - wind,5);
				xValue.innerHTML += '<li>第'+ count + '次X为：' + x + '</li>';
				yValue.innerHTML += '<li>第'+ count + '次Y为：' + y + '</li>';
				setTimeout(update,200);
			}
			else{
				errorY = 0;
				deltaY.value = 0;
				errorX = 0;
				deltaX.value = 0;
				console.log(count);
				count = 0;
			}
		}
		else{
			console.log(count);
			count = 0;
		}
		
        ctx.fillStyle = "#E7D492";
        ctx.fillRect(0, 0, c.width, c.height);
// 
        // 当前点与目标点之间的连线
        ctx.strokeStyle = "#60B99A";
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 14]);
        ctx.beginPath()
        ctx.moveTo(setpointX, setpointY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // 画一个大圆，便于观察
        ctx.fillStyle = "#7B5747";
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI, false);
        ctx.closePath();
        ctx.fill();

        // 核心小圆
        ctx.strokeStyle = "#F77825"
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.beginPath()
        ctx.moveTo(x, y);
        ctx.lineTo(x - ax * 0.3, y);
        ctx.stroke();
        ctx.beginPath()
        ctx.lineTo(x, y);
        ctx.lineTo(x, y - ay * 0.3);
        ctx.stroke();
    }
    update();

    // 点击后设置目标点
    function canvasClick(e) {
        setpointX = e.clientX;
        setpointY = e.clientY;
		xValue.innerHTML = '';
		yValue.innerHTML = '';
		xValue.innerHTML += '<li>目标X坐标' + e.clientX + '</li>';
		yValue.innerHTML += '<li>目标Y坐标' + e.clientY + '</li>';
		update();
    }
    c.addEventListener("click", canvasClick);

    // 关键值
    let kpInput = document.getElementById("kp");
    let kiInput = document.getElementById("ki");
    let windInput = document.getElementById("wind");
    let kdInput = document.getElementById("kd");

    // 每次改值的时候都更新系数
    function updateCoefficients() {
        kp = parseFloat(kpInput.value);
        ki = parseFloat(kiInput.value);
        wind = parseFloat(windInput.value);
        kd = parseFloat(kdInput.value);
        integralX = 0;
        integralY = 0;
    }

    kpInput.addEventListener("blur", updateCoefficients);
    kiInput.addEventListener("blur", updateCoefficients);
    windInput.addEventListener("blur", updateCoefficients);
    kdInput.addEventListener("blur", updateCoefficients);
	countInput.addEventListener("blur", updateCoefficients);

    kpInput.value = kp;
    kiInput.value = ki;
    windInput.value = wind;
    kdInput.value = kd;
	countInput.value = count;
})();