// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let
        width = 800,
        height = 500;

    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    // Create the SVG container
    const svg = d3.select('#boxplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group

    // Add scales
    const ageGroups = [...new Set(data.map(d => d.AgeGroup))];

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes) - 20, d3.max(data, d => d.Likes) + 20])
        .nice()
        .range([height - margin.bottom, margin.top]);

    const xScale = d3.scaleBand()
        .domain(ageGroups)
        .range([margin.left, width - margin.right])
        .padding(0.2);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr('x', width/2)
        .attr('y', height - 15)
        .text('Age Group')

    // Add y-axis label
    svg.append('text')
        .attr('x', -height/2)
        .attr('y', 10)
        .text('Number of Likes')
        .attr('transform', 'rotate(-90)')

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);

        const min = d3.min(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);

        return {min, q1, median, q3, max};
    };

    // computes quantiles by age group
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    // for each age group, calculate the quantiles
    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        // map age groups to pixel positions on the x-axis
        const x = xScale(AgeGroup);
        // calculate how big the band sizes should be given the number of age groups
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

        // Draw box
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("stroke", "black")
            .attr("fill", "lightgray");

        // Draw median line
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        //  Min whisker
        svg.append("line")
            .attr("x1", x + boxWidth * 0.25)
            .attr("x2", x + boxWidth * 0.75)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.min))
            .attr("stroke", "black");

        //  Max whisker
        svg.append("line")
            .attr("x1", x + boxWidth * 0.25)
            .attr("x2", x + boxWidth * 0.75)
            .attr("y1", yScale(quantiles.max))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black");

    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 


const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };
    let
        width = 800,
        height = 500;

    // Create the SVG container
    const svg = d3.select('#bar_plot')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
      .domain([...new Set(data.map(d => d.Platform))])
      .range([0, width])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain([...new Set(data.map(d => d.PostType))])
      .range([0, x0.bandwidth()])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes) * 1.2])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // Add scales x0 and y
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
        .attr('x', width/2)
        .attr('y', height + 40)
        .style('text-anchor', 'middle')
        .text('Platform')

    // Add y-axis label
    svg.append('text')
        .attr('x', -height/2)
        .attr('y', -40)
        .text('Average Likes')
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')

  // Group container for bars
    const dataByPlatform = d3.group(data, d => d.Platform);

    const barGroups = svg.selectAll(".barGroup")
        .data(Array.from(dataByPlatform)) // Convert Map to array of [Platform, rows]
        .enter()
        .append("g")
        .attr("transform", d => `translate(${x0(d[0])},0)`) // d[0] = Platform
        .selectAll("rect")
        .data(d => d[1]) // d[1] = array of PostType rows
        .enter()

    // Draw bars
        barGroups.append("rect")
            .attr("x", d => x1(d.PostType))
            .attr("y", d => y(d.AvgLikes))
            .attr("width", x1.bandwidth())
            .attr("height", d => height - y(d.AvgLikes))
            .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 120}, 0)`);

    const types = [...new Set(data.map(d => d.PostType))];

    types.forEach((type, i) => {

    // Alread have the text information for the legend.
    // Now add a small square/rect bar next to the text with different color.
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color(type));

        legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let
        width = 800,
        height = 500;

    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    // Create the SVG container
    const svg = d3.select('#lineplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)

    // Set up scales for x and y axes  
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height - margin.bottom, margin.top])

    let xScale = d3.scaleBand()
        .domain(data.map(d => d.Date))
        .range([margin.left, width - margin.right])
        .padding(0.5)

    // Draw the axis, you can rotate the text in the x-axis here
    svg.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale));

    svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    // Add x-axis label
    svg.append("text")
        .attr('x', width/2)
        .attr('y', height - 10)
        .style('text-anchor', 'middle')
        .text('Date')

    // Add y-axis label
    svg.append('text')
        .attr('x', -height/2)
        .attr('y', 15)
        .text('Average Likes')
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')

    // Draw the line and path. Remember to use curveNatural. 
    const line = d3.line()
        .x(d => xScale(d.Date) + xScale.bandwidth() / 2) // center the point in the band
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural);

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);
});
