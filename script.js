import * as d3 from "https://cdn.skypack.dev/d3@7";

document.addEventListener('DOMContentLoaded', () => {
  const request = new XMLHttpRequest()
  const url = './GDP-data.json'

  request.onload = () => {

    const response = JSON.parse(request.response)
    const dataset = response.data
    const w = 800
    const h = 500
    const paddingX = 50
    const paddingY = 20

    const xScale = d3.scaleTime()
                     .domain([
                       d3.min(dataset, d => d3.timeMonth(Date.parse(d[0]))),
                       d3.max(dataset, d => d3.timeMonth(Date.parse(d[0]))),
                     ])
                     .range([paddingX, w - paddingX])
                     .nice(d3.timeYear.every(1))

    const yScale = d3.scaleLinear()
                     .domain([
                       d3.min(dataset, d => d[1]),
                       d3.max(dataset, d => d[1]),
                     ])
                     .range([h - paddingY, paddingY])
                     .nice()


    const svg = d3.select('.outer-container')
                  .append('svg')
                  .attr('width', w)
                  .attr('height', h)
                  .style('border', 'none')

    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    const tooltip = d3.select('.outer-container')
                      .append('div')
                      .attr('id', 'tooltip')
                      .attr('class', 'tooltip')
                      .style('opacity', 0)

    xAxis.ticks(d3.timeYear.every(5))

    svg.selectAll('rect')
       .data(dataset)
       .enter()
       .append('rect')
       .attr('x', d => xScale(Date.parse(d[0])))
       .attr('y', d => yScale(d[1]))
       .attr('width', (w / dataset.length) / 1.2)
       .attr('height', d => h - paddingY - yScale(d[1]))
       .attr('class', 'bar')
       .attr('data-date', d => d[0])
       .attr('data-gdp', d => d[1])
       .on('mouseover', (e, d) => {
         const date = new Date(d[0])
         const year = date.getFullYear()
         const quart = year + ' Q' + Math.floor(date.getMonth() / 3 + 1)
         const gdp = '$' + d[1].toLocaleString() + ' Billion'

         e.preventDefault()

         tooltip.transition()
                .duration(200)
                .style('opacity', 0.9)
         tooltip.html(quart + '<br>' + gdp)
                .attr('data-date', e.target.attributes['data-date'].value)
                .style("left", (d3.pointer(e)[0] + 70) + "px")
                .style("top", (d3.pointer(e)[1] - 10) + "px")
       })
       .on('mouseout', (e, d) => {
         tooltip.transition()
          .duration(300)
          .style('opacity', 0)
       })

    svg.append('g')
       .attr('transform', 'translate(0, ' + (h - paddingY) + ')')
       .attr('id', 'x-axis')
       .call(xAxis)

    svg.append('g')
       .attr('transform', 'translate(' + paddingX + ', 0)')
       .attr('id', 'y-axis')
       .call(yAxis)

  }
  request.open('GET', url, true)
  request.send()

})
