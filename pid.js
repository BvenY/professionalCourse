"use strict";

(function() {

    ////////// DISPLAY RELATED //////////
    // 设置画布
    let c = document.getElementById("c");
    // 获取画布
    let ctx = c.getContext("2d");
    let print = document.getElementById("print");

    // 设置画布的高度宽度
    function resizeCanvas() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
    }
    resizeCanvas();
    // 添加事件监听，打开页面调用画布设置方法
    window.addEventListener("resize", resizeCanvas);

    ////////// PID //////////
    // PID控制的点默认的坐标
    let x = 700;
    let y = 300;
    // PID控制的点默认的坐标变化量
    let vx = 0;
    let vy = 0;

    // 当前目标点的坐标
    let setpointX = x;
    let setpointY = y;
    // Kd 坐标微分误差值 上一个时间节点的坐标值
    let prevErrorX = 0;
    let prevErrorY = 0;
    // Ki 坐标积分误差值
    let integralX = 0;
    let integralY = 0;

    // 默认的Kp Ki Kd
    let kp = 3.0;
    let ki = 0.1;
    // 设置最大的积分值 防止出现震荡过大的情况 不便于观察
    let sat = 1000;
    let kd = 80.0;

    let history = [];
    let historyTick = 0;

    // 坐标的变化量
    let deltaX = document.getElementById("deltaX");
    let deltaY = document.getElementById("deltaY");
    
    function saturate(x) {
        // 当积分的绝对值大于最大积分值时 设置为最大积分值
        return Math.min(Math.max(x,0-sat),sat)
    }

    function pid() {
        // 当前X坐标的误差值
        let errorX = setpointX - x;
        // Ki 误差积分(其实在离散的情况下就是做累加)
        integralX += errorX;
        // Kd 误差微分(当前时刻与上一时刻的误差的差值 肯定是负数)
        let derivativeX = errorX - prevErrorX;
        // 将当前的误差值赋值给上一时间，用作下一次计算的基础
        prevErrorX = errorX;

        // 同理X坐标
        let errorY = setpointY - y;
        integralY += errorY;
        let derivativeY = errorY - prevErrorY;
        prevErrorY = errorY;

        // 显示当前的误差值 保留三位小数
        // 这个加号是为了保证value为数字，document可能是字符串
        deltaY.value = +errorY.toFixed(3);
        deltaX.value = +errorX.toFixed(3);
        // 对积分值进行判断
        integralX=saturate(integralX);
        integralY=saturate(integralY);
        // 返回PID控制值 缩小1000倍便于canvas上面观察
        let xCode = kp * errorX + ki * integralX + kd * derivativeX;
        let yCode = kp * errorY + ki * integralY + kd * derivativeY;
        return [0.001 * xCode, 0.001 * yCode];
    }

    // 更新canvas画面
    function update() {
        // 调用PID函数
        let a = pid();
        let ax = a[0];
        let ay = a[1];
        // 画布单次单向最大变化值，防止变化过快过大不利于观察
        let maxA = 0.2;
        // 取绝对值最大值
        ax = Math.max(Math.min(ax, maxA), -maxA);
        ay = Math.max(Math.min(ay, maxA), -maxA);
        // 坐标的变化量
        vx += ax;
        vy += ay;
        // 当前的坐标值
        x += vx;
        y += vy;

        if (++historyTick == 5) {
            historyTick = 0;

            if (history.length >= 50) {
                history.shift();
            }
            history.push([x, y])
        }
        ctx.fillStyle = "#E7D492";
        ctx.fillRect(0, 0, c.width, c.height);

        // 运动轨迹画圆
        for (let i = 0; i < history.length; ++i) {
            ctx.fillStyle = "rgba(96,185,154,"+(i/history.length)+")";
            ctx.beginPath();
            // 画圆
            ctx.arc(history[i][0], history[i][1], 5, 0, 2 * Math.PI, true);
            ctx.closePath();
            ctx.fill();
        }

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
        ctx.lineTo(x - ax * 300, y);
        ctx.stroke();
        ctx.beginPath()
        ctx.lineTo(x, y);
        ctx.lineTo(x, y - ay * 300);
        ctx.stroke();

        setTimeout(update, 16);
    }
    update();

    // 点击后设置目标点
    function canvasClick(e) {
        setpointX = e.clientX;
        setpointY = e.clientY;
    }
    c.addEventListener("click", canvasClick);

    // 关键值
    let kpInput = document.getElementById("kp");
    let kiInput = document.getElementById("ki");
    let satInput = document.getElementById("sat");
    let kdInput = document.getElementById("kd");

    // 每次改值的时候都更新系数
    function updateCoefficients() {
        kp = parseFloat(kpInput.value);
        ki = parseFloat(kiInput.value);
        sat = parseFloat(satInput.value);
        kd = parseFloat(kdInput.value);
        integralX = 0;
        integralY = 0;
    }

    kpInput.addEventListener("blur", updateCoefficients);
    kiInput.addEventListener("blur", updateCoefficients);
    satInput.addEventListener("blur", updateCoefficients);
    kdInput.addEventListener("blur", updateCoefficients);

    kpInput.value = kp;
    kiInput.value = ki;
    satInput.value = sat;
    kdInput.value = kd;

})();
