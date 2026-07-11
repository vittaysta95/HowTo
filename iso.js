/* ===================================================================
   ISO.js — tiny isometric SVG drawing library for the LEGO-guide look.
   No dependencies. Exposes window.ISO:

     ISO.shade(hex, f)        lighten (f>0) / darken (f<0) a hex color
     ISO.minifig(cx, baseY, s, torsoColor, hatColor)  screen-space minifig
     ISO.scene(ox, oy, unit)  returns a drawing context bound to an
                              origin + unit scale, with methods:
        .pt(x,y,z)            project 3D grid coords -> [screenX, screenY]
        .poly(points, fill)   filled polygon from 3D points
        .line(a, b, stroke, w)
        .box(x,y,z,w,d,h,color,opts)   iso box, 3 shaded faces
             opts.studs: true | {step:n}   LEGO studs on the top face
             opts.texture: 'brick'|'wood'|'stucco'|'panel'
             opts.outline: false to skip edge lines
        .flat(x,y,z,w,d,color)          ground plate (top face only)
        .gableRoof/.hipRoof/.shedRoof/.flatRoof(x,y,z,w,d,rise,color,material)
             material: 'tile'|'metal'|'shingle'|null
        .windowLeft(xFace...) / .doorLeft / .doorRight  face decals
        .tree(x,y,z,h)        trunk + canopy
        .arrow(x,y,zFrom,zTo) LEGO-manual style drop-in arrow

   Projection: classic 2:1 isometric.
     screenX = ox + (x - y) * 0.866 * U
     screenY = oy + (x + y) * 0.5  * U - z * U
   +x runs toward the lower-right, +y toward the lower-left, +z up.
   The two visible side faces of a box are the y+d face ("left", lit)
   and the x+w face ("right", shadowed). Draw far objects (small x+y)
   before near ones.
=================================================================== */
window.ISO = (function(){
  'use strict';

  function clamp(v){ return Math.max(0, Math.min(255, Math.round(v))); }

  function shade(hex, f){
    var r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    if(f >= 0){ r = clamp(r + (255-r)*f); g = clamp(g + (255-g)*f); b = clamp(b + (255-b)*f); }
    else { r = clamp(r*(1+f)); g = clamp(g*(1+f)); b = clamp(b*(1+f)); }
    return '#' + ((1<<24) + (r<<16) + (g<<8) + b).toString(16).slice(1);
  }

  function num(n){ return (Math.round(n*10)/10); }

  function scene(ox, oy, unit){
    var U = unit || 10, COS = 0.866, SIN = 0.5;

    function pt(x, y, z){ return [ox + (x - y)*COS*U, oy + (x + y)*SIN*U - (z||0)*U]; }

    function ptsStr(list){
      return list.map(function(p){ var q = pt(p[0],p[1],p[2]); return num(q[0]) + ',' + num(q[1]); }).join(' ');
    }

    function poly(list, fill, extra){
      return '<polygon points="' + ptsStr(list) + '" fill="' + fill + '"' + (extra||'') + '/>';
    }

    function line(a, b, stroke, w, extra){
      var A = pt(a[0],a[1],a[2]), B = pt(b[0],b[1],b[2]);
      return '<line x1="'+num(A[0])+'" y1="'+num(A[1])+'" x2="'+num(B[0])+'" y2="'+num(B[1])+'" stroke="'+stroke+'" stroke-width="'+(w||1)+'" stroke-linecap="round"'+(extra||'')+'/>';
    }

    function stud(cx, cy, zt, color){
      var r = 0.3, h = 0.22;
      var rx = num(1.2247*r*U), ry = num(0.7071*r*U);
      var B = pt(cx, cy, zt), T = pt(cx, cy, zt + h);
      var side = shade(color, 0.1), top = shade(color, 0.38);
      return '<ellipse cx="'+num(B[0])+'" cy="'+num(B[1])+'" rx="'+rx+'" ry="'+ry+'" fill="'+side+'"/>' +
             '<rect x="'+num(B[0]-rx)+'" y="'+num(T[1])+'" width="'+num(rx*2)+'" height="'+num(B[1]-T[1])+'" fill="'+side+'"/>' +
             '<ellipse cx="'+num(T[0])+'" cy="'+num(T[1])+'" rx="'+rx+'" ry="'+ry+'" fill="'+top+'"/>';
    }

    function studs(x, y, zt, w, d, color, cfg){
      var step = (cfg && cfg.step) || 1, s = '';
      for(var i = step/2; i < w; i += step){
        for(var j = step/2; j < d; j += step){
          s += stud(x + i, y + j, zt, color);
        }
      }
      return s;
    }

    function texture(type, x, y, z, w, d, h, color){
      var t = '', c = shade(color, -0.3), Yd = y + d, Xw = x + w, zc, i;
      var thin = ' opacity="0.55"';
      if(type === 'brick' || type === 'wood'){
        var course = type === 'brick' ? 0.62 : 0.5;
        var n = 0;
        for(zc = z + course; zc < z + h - 0.05; zc += course, n++){
          t += line([x, Yd, zc], [Xw, Yd, zc], c, 0.8, thin);
          t += line([Xw, Yd, zc], [Xw, y, zc], c, 0.8, thin);
          if(type === 'brick'){
            var off = (n % 2) ? 0.75 : 0.25;
            for(i = off; i < w; i += 1.5) t += line([x+i, Yd, zc], [x+i, Yd, Math.min(zc+course, z+h)], c, 0.7, thin);
            for(i = off; i < d; i += 1.5) t += line([Xw, Yd - i, zc], [Xw, Yd - i, Math.min(zc+course, z+h)], c, 0.7, thin);
          }
        }
      } else if(type === 'panel'){
        for(i = 1.6; i < w; i += 1.6) t += line([x+i, Yd, z], [x+i, Yd, z+h], c, 0.8, thin);
        for(i = 1.6; i < d; i += 1.6) t += line([Xw, Yd - i, z], [Xw, Yd - i, z+h], c, 0.8, thin);
      }
      // 'stucco' and unknown types: no lines (smooth render)
      return t;
    }

    function edges(x, y, z, w, d, h){
      var c = 'rgba(0,0,0,0.28)', s = '';
      s += line([x, y+d, z+h], [x+w, y+d, z+h], c, 1);
      s += line([x+w, y+d, z+h], [x+w, y, z+h], c, 1);
      s += line([x+w, y+d, z+h], [x+w, y+d, z], c, 1);
      return s;
    }

    function box(x, y, z, w, d, h, color, opts){
      opts = opts || {};
      var top = shade(color, 0.28), left = shade(color, 0.03), right = shade(color, -0.26);
      var s = '';
      s += poly([[x, y+d, z+h],[x+w, y+d, z+h],[x+w, y+d, z],[x, y+d, z]], left);
      s += poly([[x+w, y+d, z+h],[x+w, y, z+h],[x+w, y, z],[x+w, y+d, z]], right);
      s += poly([[x, y, z+h],[x+w, y, z+h],[x+w, y+d, z+h],[x, y+d, z+h]], top);
      if(opts.texture) s += texture(opts.texture, x, y, z, w, d, h, color);
      if(opts.outline !== false) s += edges(x, y, z, w, d, h);
      if(opts.studs) s += studs(x, y, z+h, w, d, color, opts.studs === true ? null : opts.studs);
      return s;
    }

    function flat(x, y, z, w, d, color, extra){
      return poly([[x, y, z],[x+w, y, z],[x+w, y+d, z],[x, y+d, z]], color, extra);
    }

    function lerp3(a, b, t){ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t]; }

    function roofLines(eL, eR, rL, rR, material, color){
      var s = '', c = shade(color, -0.32), t, i;
      var thin = ' opacity="0.6"';
      if(material === 'tile'){
        for(t = 0.18; t < 1; t += 0.18) s += line(lerp3(eL, rL, t), lerp3(eR, rR, t), c, 1, thin);
      } else if(material === 'shingle'){
        for(t = 0.12; t < 1; t += 0.12) s += line(lerp3(eL, rL, t), lerp3(eR, rR, t), c, 0.7, thin);
      } else if(material === 'metal'){
        for(i = 0.12; i < 1; i += 0.16) s += line(lerp3(eL, eR, i), lerp3(rL, rR, i), c, 0.8, thin);
      }
      return s;
    }

    function gableRoof(x, y, z, w, d, rise, color, material){
      var midY = y + d/2;
      var eL = [x, y+d, z], eR = [x+w, y+d, z], rL = [x, midY, z+rise], rR = [x+w, midY, z+rise];
      var s = '';
      s += poly([eL, eR, rR, rL], shade(color, 0.12));                       // front slope
      s += poly([[x+w, y+d, z],[x+w, y, z],[x+w, midY, z+rise]], shade(color, -0.28)); // gable end
      s += roofLines(eL, eR, rL, rR, material, color);
      s += line(rL, rR, 'rgba(0,0,0,0.3)', 1.2);
      s += line(eL, eR, 'rgba(0,0,0,0.25)', 1);
      return s;
    }

    function hipRoof(x, y, z, w, d, rise, color, material){
      var k = Math.min(2, w*0.28), midY = y + d/2;
      var eL = [x, y+d, z], eR = [x+w, y+d, z], rL = [x+k, midY, z+rise], rR = [x+w-k, midY, z+rise];
      var s = '';
      s += poly([eL, eR, rR, rL], shade(color, 0.12));
      s += poly([[x+w, y+d, z],[x+w, y, z], rR], shade(color, -0.28));
      s += roofLines(eL, eR, rL, rR, material, color);
      s += line(rL, rR, 'rgba(0,0,0,0.3)', 1.2);
      return s;
    }

    function shedRoof(x, y, z, w, d, rise, color, material){
      var hL = [x, y, z+rise], hR = [x+w, y, z+rise], lL = [x, y+d, z+0.2], lR = [x+w, y+d, z+0.2];
      var s = '';
      s += poly([hL, hR, lR, lL], shade(color, 0.12));                        // slanted top
      s += poly([hR, [x+w, y, z], [x+w, y+d, z], lR], shade(color, -0.28));   // right face
      s += roofLines(lL, lR, hL, hR, material, color);
      s += line(hL, hR, 'rgba(0,0,0,0.3)', 1.2);
      return s;
    }

    function flatRoof(x, y, z, w, d, rise, color){
      // Same signature as the other roofs (rise is ignored) so callers can
      // switch roof types without reshuffling arguments.
      return box(x, y, z, w, d, 0.5, color || rise, {outline: true});
    }

    // Decals drawn on the front-left (y+d) or front-right (x+w) face of an existing box.
    function windowLeft(x0, x1, Yd, z0, z1){
      var frame = poly([[x0, Yd, z1],[x1, Yd, z1],[x1, Yd, z0],[x0, Yd, z0]], '#FFFFFF');
      var m = 0.14;
      var glass = poly([[x0+m, Yd, z1-m],[x1-m, Yd, z1-m],[x1-m, Yd, z0+m],[x0+m, Yd, z0+m]], '#9FD3EA');
      var bar = line([(x0+x1)/2, Yd, z0+m], [(x0+x1)/2, Yd, z1-m], '#FFFFFF', 1.2);
      return frame + glass + bar;
    }

    function doorLeft(x0, x1, Yd, z0, z1, color){
      var d1 = poly([[x0, Yd, z1],[x1, Yd, z1],[x1, Yd, z0],[x0, Yd, z0]], color || '#5B4636');
      var knobP = pt(x1 - 0.25, Yd, (z0+z1)/2);
      return d1 + '<circle cx="'+num(knobP[0])+'" cy="'+num(knobP[1])+'" r="'+num(0.14*U)+'" fill="#F5C518"/>';
    }

    function doorRight(Xw, y0, y1, z0, z1, color){
      return poly([[Xw, y0, z1],[Xw, y1, z1],[Xw, y1, z0],[Xw, y0, z0]], color || '#7C8B95');
    }

    function tree(x, y, z, h){
      var s = box(x-0.3, y-0.3, z, 0.6, 0.6, h, '#7C5A3C', {outline:false});
      var T = pt(x, y, z + h);
      s += '<ellipse cx="'+num(T[0]-0.35*U)+'" cy="'+num(T[1]+0.2*U)+'" rx="'+num(1.15*U)+'" ry="'+num(0.9*U)+'" fill="'+shade('#5C9A4C',-0.12)+'"/>';
      s += '<ellipse cx="'+num(T[0]+0.4*U)+'" cy="'+num(T[1]-0.05*U)+'" rx="'+num(1.15*U)+'" ry="'+num(0.9*U)+'" fill="#5C9A4C"/>';
      s += '<ellipse cx="'+num(T[0])+'" cy="'+num(T[1]-0.6*U)+'" rx="'+num(1.05*U)+'" ry="'+num(0.85*U)+'" fill="'+shade('#5C9A4C',0.16)+'"/>';
      return s;
    }

    function arrow(x, y, zFrom, zTo){
      var A = pt(x, y, zFrom), B = pt(x, y, zTo);
      var s = '<line x1="'+num(A[0])+'" y1="'+num(A[1])+'" x2="'+num(B[0])+'" y2="'+num(B[1]+ -6)+'" stroke="#1C2B1E" stroke-width="6" stroke-linecap="round"/>';
      s += '<line x1="'+num(A[0])+'" y1="'+num(A[1])+'" x2="'+num(B[0])+'" y2="'+num(B[1]-6)+'" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>';
      s += '<polygon points="'+num(B[0]-6)+','+num(B[1]-8)+' '+num(B[0]+6)+','+num(B[1]-8)+' '+num(B[0])+','+num(B[1]+2)+'" fill="#FFFFFF" stroke="#1C2B1E" stroke-width="1.6"/>';
      return s;
    }

    function shadow(x, y, w, d){
      var C = pt(x + w/2, y + d/2, 0);
      return '<ellipse cx="'+num(C[0])+'" cy="'+num(C[1]+3)+'" rx="'+num(w*0.75*U)+'" ry="'+num(d*0.42*U)+'" fill="rgba(0,0,0,0.10)"/>';
    }

    return { pt: pt, poly: poly, line: line, box: box, flat: flat,
      gableRoof: gableRoof, hipRoof: hipRoof, shedRoof: shedRoof, flatRoof: flatRoof,
      windowLeft: windowLeft, doorLeft: doorLeft, doorRight: doorRight,
      tree: tree, arrow: arrow, shadow: shadow, U: U };
  }

  function minifig(cx, baseY, s, torso, hatColor){
    s = s || 1; torso = torso || '#E8792A';
    var y = baseY;
    function r(x, yy, w, h, f, rx){
      return '<rect x="'+num(cx+x*s)+'" y="'+num(y+yy*s)+'" width="'+num(w*s)+'" height="'+num(h*s)+'" fill="'+f+'"'+(rx?' rx="'+num(rx*s)+'"':'')+'/>';
    }
    var g = '';
    g += r(-7, -14, 6, 14, '#2C5AA0', 1.2);
    g += r(1, -14, 6, 14, '#2C5AA0', 1.2);
    g += r(-8, -17, 16, 4, '#24487F', 1.2);
    g += '<path d="M ' + num(cx-11*s) + ' ' + num(y-34*s) + ' h ' + num(22*s) + ' l ' + num(-2*s) + ' ' + num(18*s) + ' h ' + num(-18*s) + ' z" fill="' + torso + '"/>';
    g += r(-14, -32, 4.4, 12, shade(torso, -0.18), 2);
    g += r(9.6, -32, 4.4, 12, shade(torso, -0.18), 2);
    g += '<circle cx="'+num(cx-11.6*s)+'" cy="'+num(y-18.5*s)+'" r="'+num(2.6*s)+'" fill="#F5C518"/>';
    g += '<circle cx="'+num(cx+11.6*s)+'" cy="'+num(y-18.5*s)+'" r="'+num(2.6*s)+'" fill="#F5C518"/>';
    g += r(-5.5, -46, 11, 11.5, '#F5C518', 3.4);
    g += '<circle cx="'+num(cx-2.4*s)+'" cy="'+num(y-41.5*s)+'" r="'+num(1*s)+'" fill="#1C2B1E"/>';
    g += '<circle cx="'+num(cx+2.4*s)+'" cy="'+num(y-41.5*s)+'" r="'+num(1*s)+'" fill="#1C2B1E"/>';
    g += '<path d="M ' + num(cx-2.6*s) + ' ' + num(y-38.6*s) + ' q ' + num(2.6*s) + ' ' + num(2.2*s) + ' ' + num(5.2*s) + ' 0" stroke="#1C2B1E" stroke-width="' + num(0.9*s) + '" fill="none"/>';
    if(hatColor !== null){
      hatColor = hatColor || '#F5C518';
      g += '<path d="M ' + num(cx-7*s) + ' ' + num(y-45.2*s) + ' a ' + num(7*s) + ' ' + num(6*s) + ' 0 0 1 ' + num(14*s) + ' 0 z" fill="' + hatColor + '"/>';
      g += r(-8.4, -46.4, 16.8, 2.2, hatColor, 1.2);
    }
    return g;
  }

  return { scene: scene, shade: shade, minifig: minifig };
})();
