var jsonfile		  = require('jsonfile');
var colors			  = require('colors');

// this variable represent all positions where to apply the affinity propagation 
var pointsPositions = [[2,3],[2,2],[2,5],[1,1],[1,16],
						[23,24],[2,3],[5,4],[5,6],[4,5],
						[6,7],[3,6],[7,4],[3,2],[7,4]];

var output_1			  = './assignments.js'
var output_2			  = './centers.js'
//N is the number of two-dimension data points
//s is the similarity matrix
//r is the responsibility matrix
//a is the availabiltiy matrix
//iter is the maximum number of iterations
//lambda is the damping factor
// const int N = 25;
// double s[N][N] = {0};

// double r[N][N] = {0};
// double a[N][N] = {0};

var N 	   = pointsPositions.length;
// var N = 2;


module.exports = function affintyPropagation()
{
	var s 	   	  = [];
	var r 	   	  = [];
	var a 	   	  = [];
	var iter   	  = 400;
	var lambda 	  = 0.9;
	var gamma	  = 1;
	var menlambda = 1 - lambda;

	start(s,a,r,gamma);


	console.log(JSON.stringify(s));
	console.log('-'*40)
	console.log(JSON.stringify(a));
	console.log('-'*40)
	console.log(JSON.stringify(r));
	console.log('-'*40)
	
	for(var m=0; m<iter; m++) 
	{
		// console.log('iterazione',m);

		//update responsibility
		for(var i=0; i<N; i++) 
		{

			for(var k=0; k<N; k++) 
			{
				var maX ;
				var values =[];
				for(var kk=0; kk<k; kk++) 
				{
					values.push(s[i][kk]+a[i][kk]);
				}

				for(var kk=k+1; kk<N; kk++) 
				{
					values.push(s[i][kk]+a[i][kk]);
				}

				r[i][k] = (menlambda*(s[i][k] - Math.max(...values)) + lambda*r[i][k]);
				// console.log(colors.inverse(parseFloat(s[i][k] - maX)))
			}
		}
		// console.log('----------------------');
		//update availability
		for(var i=0; i<N; i++) 
		{
			for(var k=0; k<N; k++) 
			{
				var sum = 0;

				if(i===k) 
				{

					for(var ii=0; ii<i; ii++) 
					{
						sum += Math.max(0,r[ii][k]);
					}

					for(var ii=i+1; ii<N; ii++) 
					{

						sum += Math.max(0,r[ii][k]);
					}

					a[i][k] = (menlambda*sum + lambda*a[i][k]);


				} else
				{
					
					if (i > k)
					{
						maxik = i;
						minik = k;
					}else
					{
						maxik = k;
						minik = i;
					}

					for(var ii=0; ii<minik; ii++) 
					{

						sum += Math.max(0,r[ii][k]);
					}

					for(var ii= minik+1; ii<maxik; ii++) 
					{
						sum += Math.max(0,r[ii][k]);
					}

					for(var ii=maxik+1; ii<N; ii++) 
					{
						sum += Math.max(0,r[ii][k]);
					}

					a[i][k] = (menlambda*Math.min(0,r[k][k]+sum) + lambda*a[i][k]);

				}
			}
		}
		// console.log(colors.inverse(colors.white(JSON.stringify(r))))
		// console.log(colors.inverse(colors.green(JSON.stringify(a))))
	}

	for (var i = 0; i < N; i++) {
		console.log('r['+i+']['+i+'] =', r[i][i],'a['+i+']['+i+'] =', a[i][i]);
	}

	//find the exemplar on the diagonal sum
	var e =[];
	var center = [];

	for(var i=0; i<N; i++) 
	{
		e[i] = (r[i][i] + a[i][i]);

		console.log('e['+i+']:',e[i]);

		if(e[i] > 0) 
		{
			center.push(i);
		}
	}

	console.log('all clusters representant are ',colors.bold(JSON.stringify(center)));

	//data point assignment, assignements[i] is the exemplar for data point i
	var assignements = [];
	

	for(var i=0; i<N; i++)
	{
		var values = [];
		var index  = {};
		for(var j=0; j<center.length; j++)
		{
			var c = center[j];

			values[j] = s[i][c];
			index[s[i][c]] = c;
		}



		assignements[i] = index[Math.max(...values)];
	}

	console.log('all clusters are:',colors.bgMagenta(JSON.stringify(assignements)));
	// console.log(colors.bgMagenta(assignements.length));

	//pointsPositions['clusters'] ={}

	// for (var i = 0; i < center.length; i++) 
	// {
	// 	pointsPositions['clusters'][i]= {'positions': [],
	// 								 'mean': pointsPositions['data'][center[i]],
	// 								 'el': center[i] };


	// 	for (var j = 0; j < assignements.length; j++) 
	// 	{
	// 		if(assignements[j] === center[i] || center[i] ===j )  pointsPositions['clusters'][i]['positions'].push(j);
	// 	}
	// }

	jsonfile.writeFile(output_1,
					   assignements,
					   {spaces: 2},
					   function(err) {console.error(err)});
	jsonfile.writeFile(output_2,
					   center,
					   {spaces: 2},
					   function(err) {console.error(err)});
}

function eucDist(pos1,pos2) 
{
	squares = [];

	console.log(pos1,pos2,'cazzo');

	for (var i = 0; i < 2; i++) 
	{
		squares.push((pos1[i] - pos2[i])*(pos1[i] - pos2[i]));
	}
	d = Math.sqrt(squares[0] + squares[1]);

	if (d === 0)
	{
		return 0
	}
	
	
  	return d / (1 + d)
}



function start(s,a,r,gamma)
{
	//read data distances defining s inizializing it 
	//and set Availibility and Responsability to 0

	
	for (var i = 0; i < N; i++) 
	{
		var pos1 = pointsPositions[i];

		console.log(pointsPositions[i])


		s[i] = [];
		a[i] = [];
		r[i] = [];

		for (var j = 0; j < N; j++) 
		{
			var pos2 = pointsPositions[j];

			s[i][j] = -1 * eucDist(pos1, pos2);
			a[i][j] = 0;
			r[i][j] = 0;

		}

	}

	for (var k = 0; k < N; k++) 
	{
		var avg = 0;

		for (var r = 0; r < N; r++) 
		{
			avg+=s[r][k];
		}	


		s[k][k] = gamma* (avg/(N-1));
	}


}

